require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!url || !key) {
  console.warn("Skipping smoke:sql (missing SUPABASE_URL / key).");
  process.exit(0);
}

const supabase = createClient(url, key);

(async () => {
  try {
    // 1) v_sessions exists and selects
    const { data: sess, error: e1 } = await supabase
      .from('v_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5);
    if (e1) throw e1;
    console.log('v_sessions OK. rows=', sess?.length ?? 0);

    // 2) v_latest_assessments_v11 exposes calibrated fits
    const { data: latest, error: e2 } = await supabase
      .from('v_latest_assessments_v11')
      .select('type_code, fit_value, fit_band, results_version')
      .order('created_at', { ascending: false })
      .limit(8);
    if (e2) throw e2;
    console.log('v_latest_assessments_v11 OK. rows=', latest?.length ?? 0);

    // 3) Quick variation sanity (not all identical)
    const fits = (latest || []).map(r => r.fit_value).filter(v => v != null);
    const uniq = [...new Set(fits.map(String))];
    if (fits.length > 1 && uniq.length <= 1) {
      console.warn('WARNING: Calibrated fits look identical:', uniq[0]);
    } else {
      console.log('Calibrated fits show variation:', uniq);
    }

    process.exit(0);
  } catch (err) {
    console.error('Smoke SQL failed:', err.message || err);
    process.exit(1);
  }
})();
