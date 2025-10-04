import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe, corsHeaders } from "../_shared/stripe.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, supabaseClient } = await getAuthenticatedUser(req);
    const { resultId } = await req.json() as { resultId: string };

    if (!resultId) {
      throw new Error("resultId is required");
    }

    const advancedPrice = Deno.env.get("STRIPE_PRICE_ADV");
    if (!advancedPrice) {
      throw new Error("STRIPE_PRICE_ADV not configured");
    }

    // Check for existing Stripe customer
    const { data: existingCustomer } = await supabaseClient
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    const sessionParams: any = {
      mode: "payment",
      automatic_tax: { enabled: true },
      line_items: [{ price: advancedPrice, quantity: 1 }],
      metadata: {
        sku: "prism_advanced_pack",
        userId: user.id,
        resultId
      },
      success_url: `${Deno.env.get("APP_URL")}/results/${resultId}?upgrade=success&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("APP_URL")}/results/${resultId}`
    };

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
    console.error("Advanced checkout error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
