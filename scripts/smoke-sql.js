import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!url || !key) {
  console.warn("Skipping smoke:sql (missing SUPABASE_URL / key).");
  process.exit(0);
}

const supabase = createClient(url, key);

(async () => {
  try {
    // 1) v_sessions should exist and select cleanly
    const { data: sess, error: e1 } = await supabase
      .from("v_sessions")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(5);
    if (e1) throw e1;
    console.log("v_sessions ok. Rows:", sess?.length ?? 0);

    // 2) v_latest_assessments_v11 should surface calibrated fits
    const { data: latest, error: e2 } = await supabase
      .from("v_latest_assessments_v11")
      .select("type_code, fit_value, fit_band, results_version")
      .order("created_at", { ascending: false })
      .limit(5);
    if (e2) throw e2;
    console.log("v_latest_assessments_v11 ok. Rows:", latest?.length ?? 0);

    // 3) Sanity: calibrated fits should not all be identical
    const fits = (latest || []).map(r => r.fit_value);
    const uniq = [...new Set(fits.map(String))];
    if (uniq.length <= 1 && fits.length > 1) {
      console.warn("WARNING: Calibrated fits look suspiciously identical:", uniq[0]);
    } else {
      console.log("Calibrated fits show variation:", uniq);
    }

    const { data: hist, error: e3 } = await supabase
      .from("v_fit_histogram")
      .select("bin_label, n")
      .limit(100);
    if (!e3) {
      const total = (hist || []).reduce((a, b) => a + b.n, 0);
      if (total > 20) {
        const nonzero = (hist || []).filter(b => b.n > 0).length;
        if (nonzero <= 2) console.warn("WARNING: Fit histogram looks collapsed.");
      }
    }

    const { data: pv, error: e4 } = await supabase
      .from("v_latest_assessments_v11")
      .select("results_version")
      .limit(1);
    if (!e4 && pv?.[0]?.results_version !== "v1.1") {
      console.warn("WARNING: results_version not v1.1 in latest view.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Smoke SQL failed:", err.message || err);
    process.exit(1);
  }
})();
