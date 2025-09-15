#!/usr/bin/env bash
# scripts/apply_supabase_migrations.sh
set -euo pipefail

EXPECTED_PROJECT_REF="${EXPECTED_PROJECT_REF:-gnkuikentdtnatazeriu}"

if ! command -v supabase >/dev/null 2>&1; then
  echo "ERROR: Supabase CLI is not installed or not on PATH." >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "${REPO_ROOT}"

if [[ ! -f supabase/config.toml ]]; then
  echo "ERROR: supabase/config.toml not found; run from the repo root." >&2
  exit 1
fi

CONFIG_PROJECT_REF="$(awk -F' *= *' '/^project_id/ {gsub(/"/,"",$2); print $2}' supabase/config.toml)"
if [[ -z "${CONFIG_PROJECT_REF}" ]]; then
  echo "ERROR: Could not read project_id from supabase/config.toml." >&2
  exit 1
fi

if [[ "${CONFIG_PROJECT_REF}" != "${EXPECTED_PROJECT_REF}" ]]; then
  printf 'ERROR: supabase/config.toml project_id is "%s" but expected "%s".\n' \
    "${CONFIG_PROJECT_REF}" "${EXPECTED_PROJECT_REF}" >&2
  echo "Update EXPECTED_PROJECT_REF or re-link the repo before rerunning." >&2
  exit 1
fi

LINK_STATUS="$(supabase link status 2>&1 || true)"
if [[ "${LINK_STATUS}" != *"${EXPECTED_PROJECT_REF}"* ]]; then
  printf '⚠️  Supabase CLI is not linked to project "%s".\n' "${EXPECTED_PROJECT_REF}" >&2
  echo "${LINK_STATUS}" >&2
  printf 'Run: supabase link --project-ref %s\n' "${EXPECTED_PROJECT_REF}" >&2
  exit 1
fi

echo "Stopping any running local Supabase services…"
supabase stop >/dev/null 2>&1 || true

echo "Resetting local development database from migrations…"
supabase db reset --force

echo "Pushing all migrations to remote project ${EXPECTED_PROJECT_REF}…"
supabase db push --include-all

echo "Restarting local Supabase stack…"
supabase start

echo "✅ Supabase migrations applied locally and remotely; rerun the assessment flow to confirm fixes."
