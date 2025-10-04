import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe, corsHeaders } from "../_shared/stripe.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";

const PRICE_MAP: Record<string, string> = {
  monthly: Deno.env.get("STRIPE_PRICE_BETA_MONTHLY") || "",
  annual: Deno.env.get("STRIPE_PRICE_BETA_ANNUAL") || "",
  lifetime: Deno.env.get("STRIPE_PRICE_BETA_LIFETIME") || ""
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, supabaseClient } = await getAuthenticatedUser(req);
    const { plan, resultId } = await req.json() as { plan: "monthly" | "annual" | "lifetime", resultId?: string };

    if (!plan || !PRICE_MAP[plan]) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    // Check if user already has a Stripe customer
    const { data: existingCustomer } = await supabaseClient
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    const mode = plan === "lifetime" ? "payment" : "subscription";

    const sessionParams: any = {
      mode,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      line_items: [{ price: PRICE_MAP[plan], quantity: 1 }],
      metadata: {
        sku: "prism_beta_membership",
        plan,
        userId: user.id,
        resultId: resultId || ""
      },
      success_url: `${Deno.env.get("APP_URL")}/account?purchase=success&plan=${plan}&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("APP_URL")}/account`
    };

    // Use existing customer or create new one
    if (existingCustomer) {
      sessionParams.customer = existingCustomer.stripe_customer_id;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err: any) {
    console.error("Checkout error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
