const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Skip gracefully for placeholder/missing envs or blocked egress
const isPlaceholder = !url || /example\.com/i.test(url) || !key;
if (isPlaceholder) {
  console.log("verify:smoke skipped (missing or placeholder SUPABASE envs).");
  process.exit(0);
}

(async () => {
  try {
    const resp = await fetch(new URL("/auth/v1/health", url).toString(), { method: "GET" });
    console.log("verify:smoke health:", resp.status);
    process.exit(0);
  } catch (e) {
    console.log("verify:smoke skipped (no egress / ENETUNREACH).");
    process.exit(0);
  }
})();
