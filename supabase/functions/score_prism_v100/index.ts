import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(() => new Response(
  JSON.stringify({ status: "error", error: "PRISM v1.0 scorer not available" }),
  { status: 501, headers: { "Content-Type": "application/json" } }
));
