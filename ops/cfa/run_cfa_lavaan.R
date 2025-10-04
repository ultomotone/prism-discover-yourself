#!/usr/bin/env Rscript
# CFA Computation Script for PRISM Assessment
# Runs lavaan CFA and outputs results to JSON

library(DBI)
library(RPostgres)
library(dplyr)
library(tidyr)
library(jsonlite)
library(lavaan)

cat("[CFA] Starting computation\n")

# Connect to database
pg <- dbConnect(
  RPostgres::Postgres(),
  host = Sys.getenv("PGHOST"),
  port = as.integer(Sys.getenv("PGPORT", "5432")),
  dbname = Sys.getenv("PGDATABASE"),
  user = Sys.getenv("PGUSER"),
  password = Sys.getenv("PGPASSWORD")
)

ver <- Sys.getenv("RESULTS_VERSION", "v1.2.1")
cat(sprintf("[CFA] Results version: %s\n", ver))

# 1) Fetch scale-to-item mappings
cat("[CFA] Fetching scale mappings...\n")
map <- dbGetQuery(pg, "
  SELECT tag AS scale_tag, question_id, weight
  FROM public.assessment_scoring_key
  WHERE scale_type IN ('LIKERT_1_5', 'LIKERT_1_7')
    AND tag IS NOT NULL
    AND tag != ''
")

if (nrow(map) == 0) {
  stop("[CFA] No scale mappings found!")
}

cat(sprintf("[CFA] Found %d item mappings across %d scales\n", 
    nrow(map), length(unique(map$scale_tag))))

# 2) Fetch response data (answer_numeric 1-7)
cat("[CFA] Fetching response data...\n")
resp <- dbGetQuery(pg, "
  SELECT r.session_id, r.question_id, r.answer_numeric::numeric AS x
  FROM public.assessment_responses r
  JOIN public.assessment_sessions s ON s.id = r.session_id
  WHERE r.answer_numeric BETWEEN 1 AND 7
    AND s.status = 'completed'
")

if (nrow(resp) == 0) {
  stop("[CFA] No response data found!")
}

cat(sprintf("[CFA] Loaded %d responses from %d sessions\n", 
    nrow(resp), length(unique(resp$session_id))))

# Check sample size before proceeding
n_sessions <- length(unique(resp$session_id))
min_required <- 200
if (n_sessions < min_required) {
  cat(sprintf("[CFA] ⚠️  WARNING: Only %d sessions (need %d+ for stable CFA)\n", 
      n_sessions, min_required))
  cat("[CFA] Model may not converge with small sample\n")
}

# Normalize 1-7 to 1-5 scale (linear transformation)
resp <- resp %>% 
  mutate(x5 = 1 + (x - 1) * (4/6))

# 3) Build wide matrix with Q_<id> columns
cat("[CFA] Building wide response matrix...\n")
resp$col <- paste0("Q_", resp$question_id)
wide <- resp %>% 
  select(session_id, col, x5) %>% 
  pivot_wider(names_from = col, values_from = x5)

cat(sprintf("[CFA] Matrix: %d sessions x %d items\n", 
    nrow(wide), ncol(wide) - 1))

# 4) Apply reverse scoring (multiply by -1 and add 6)
cat("[CFA] Applying reverse scoring...\n")
rev_items <- map %>% 
  mutate(col = paste0("Q_", question_id)) %>% 
  select(scale_tag, question_id, weight, col)

for (i in 1:nrow(rev_items)) {
  col <- rev_items$col[i]
  if (!col %in% names(wide)) next
  if (is.na(rev_items$weight[i])) next
  if (rev_items$weight[i] < 0) {
    wide[[col]] <- 6 - wide[[col]]
  }
}

# 5) Build lavaan model string (one factor per scale_tag)
cat("[CFA] Building CFA model...\n")
items_by_scale <- rev_items %>%
  group_by(scale_tag) %>% 
  summarise(items = paste(unique(col), collapse = " + "), .groups = "drop")

model_lines <- paste0(items_by_scale$scale_tag, " =~ ", items_by_scale$items)
model <- paste(model_lines, collapse = "\n")

cat("[CFA] Model specification:\n")
cat(model, "\n")

# 6) Fit CFA
cat("[CFA] Fitting CFA model...\n")
flush.console()

# Calculate complete cases for diagnostics
n_complete <- sum(complete.cases(wide[, -1]))  # Exclude session_id column
cat(sprintf("[CFA] Complete cases: %d (%.1f%%)\n", 
    n_complete, 100 * n_complete / nrow(wide)))
flush.console()

fit <- tryCatch({
  cat("[CFA] Attempting CFA with FIML estimation...\n")
  flush.console()
  cfa(model, data = wide, std.lv = TRUE, missing = "fiml")
}, error = function(e) {
  cat(sprintf("[CFA] ❌ ERROR during model fitting:\n"))
  cat(sprintf("  Error message: %s\n", e$message))
  cat(sprintf("  Sample size: %d sessions\n", nrow(wide)))
  cat(sprintf("  Variables: %d items\n", ncol(wide) - 1))
  cat(sprintf("  Complete cases: %d (%.1f%%)\n", n_complete, 100 * n_complete / nrow(wide)))
  cat(sprintf("  Missing data: %.1f%%\n", mean(is.na(wide[, -1])) * 100))
  flush.console()
  
  # Try to diagnose multicollinearity
  cat("[CFA] Diagnosing correlation matrix...\n")
  tryCatch({
    cor_mat <- cor(wide[, -1], use = "pairwise.complete.obs")
    max_cor <- max(cor_mat[upper.tri(cor_mat)])
    cat(sprintf("  Max correlation: %.3f\n", max_cor))
    if (max_cor > 0.95) {
      cat("  ⚠️  Potential multicollinearity detected (r > 0.95)\n")
    }
  }, error = function(e2) {
    cat("  Could not compute correlation matrix\n")
  })
  flush.console()
  
  stop(e)
})

cat("[CFA] ✅ Model converged successfully\n")
flush.console()

# 7) Extract standardized loadings
cat("[CFA] Extracting loadings...\n")
std <- standardizedSolution(fit) %>% as.data.frame()

loadings <- std %>% 
  filter(op == "=~") %>%
  transmute(
    results_version = ver,
    scale_tag = lhs,
    question_id = as.integer(sub("^Q_", "", rhs)),
    lambda_std = est.std,
    theta = NA_real_
  )

# Get residual variances (theta) from ~~
resid <- std %>% 
  filter(op == "~~", lhs == rhs, grepl("^Q_", lhs)) %>%
  transmute(
    question_id = as.integer(sub("^Q_", "", lhs)), 
    theta = est.std
  )

loadings <- loadings %>% 
  left_join(resid, by = "question_id") %>%
  mutate(theta = coalesce(theta.y, theta.x)) %>%
  select(results_version, scale_tag, question_id, lambda_std, theta)

cat(sprintf("[CFA] Extracted %d loadings\n", nrow(loadings)))

# 8) Extract global fit indices
cat("[CFA] Extracting fit indices...\n")
flush.console()

# Extract basic fit indices only (avoid memory-intensive measures)
fit_measures <- tryCatch({
  cat("[CFA] Computing CFI/TLI...\n")
  flush.console()
  cfi_tli <- fitMeasures(fit, c("cfi", "tli"))
  
  cat("[CFA] Computing RMSEA...\n")
  flush.console()
  rmsea_val <- fitMeasures(fit, "rmsea")
  
  cat("[CFA] Computing SRMR...\n")
  flush.console()
  srmr_val <- fitMeasures(fit, "srmr")
  
  c(cfi_tli, rmsea = rmsea_val, srmr = srmr_val)
}, error = function(e) {
  cat(sprintf("[CFA] ERROR extracting fit indices: %s\n", e$message))
  flush.console()
  stop(e)
})

cat("[CFA] Creating fit row...\n")
flush.console()

fit_row <- data.frame(
  results_version = ver,
  model_name = "22-Factor PRISM Model",
  n = nrow(wide),
  cfi = unname(fit_measures["cfi"]),
  tli = unname(fit_measures["tli"]),
  rmsea = unname(fit_measures["rmsea"]),
  rmsea_lo = NA_real_,  # Skip CI to avoid memory issues
  rmsea_hi = NA_real_,
  srmr = unname(fit_measures["srmr"])
)

cat(sprintf("[CFA] Fit: CFI=%.3f, TLI=%.3f, RMSEA=%.3f, SRMR=%.3f\n",
    fit_row$cfi, fit_row$tli, fit_row$rmsea, fit_row$srmr))
flush.console()

# 9) (Optional) Measurement invariance - skip for now
inv <- data.frame()

# 10) Write JSON payload
cat("[CFA] Writing output JSON...\n")
dir.create("ops/cfa/out", recursive = TRUE, showWarnings = FALSE)

payload <- list(
  loadings = loadings,
  fit = fit_row,
  invariance = inv
)

json_out <- toJSON(payload, dataframe = "rows", auto_unbox = TRUE, na = "null")
writeLines(json_out, "ops/cfa/out/cfa_payload.json")

dbDisconnect(pg)

cat("[CFA] ✅ Complete - payload written to ops/cfa/out/cfa_payload.json\n")
