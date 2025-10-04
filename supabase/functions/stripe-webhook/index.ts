import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe, corsHeaders } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not set");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Missing Stripe signature");

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`[webhook] Received event: ${event.type}`);

    // Use service role client for database writes
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const thin = event.data.object as any;
        // Fetch full session with line items (thin payloads need expansion)
        const session = await stripe.checkout.sessions.retrieve(thin.id, {
          expand: ["line_items.data.price.product", "customer", "subscription"]
        });

        const userId = session.metadata?.userId;
        const sku = session.metadata?.sku;
        const plan = session.metadata?.plan;
        const customerId = typeof session.customer === "string" 
          ? session.customer 
          : session.customer?.id;

        if (!userId || !customerId) {
          console.error("Missing userId or customerId in session metadata");
          break;
        }

        // 1. Upsert stripe_customers mapping
        const { error: customerError } = await supabase
          .from("stripe_customers")
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            email: session.customer_details?.email || "",
            updated_at: new Date().toISOString()
          });

        if (customerError) {
          console.error("Failed to upsert stripe_customer:", customerError);
        }

        // 2. Grant entitlement based on SKU
        let productCode = "";
        if (sku === "prism_beta_membership") {
          productCode = `prism_beta_${plan}`; // monthly/annual/lifetime
        } else if (sku === "prism_advanced_pack") {
          productCode = "prism_advanced_pack";
        }

        if (productCode) {
          const { error: entitlementError } = await supabase
            .from("entitlements")
            .upsert({
              user_id: userId,
              product_code: productCode,
              active: true,
              granted_at: new Date().toISOString()
            });

          if (entitlementError) {
            console.error("Failed to grant entitlement:", entitlementError);
          } else {
            console.log(`Granted entitlement: ${productCode} to user ${userId}`);
          }
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

        // Look up user_id from stripe_customers
        const { data: customer } = await supabase
          .from("stripe_customers")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (customer) {
          // Update entitlement active status based on subscription status
          const isActive = ["active", "trialing"].includes(subscription.status);
          
          const { error } = await supabase
            .from("entitlements")
            .update({ active: isActive })
            .eq("user_id", customer.user_id)
            .in("product_code", ["prism_beta_monthly", "prism_beta_annual"]);

          if (error) {
            console.error("Failed to update subscription status:", error);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

        const { data: customer } = await supabase
          .from("stripe_customers")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (customer) {
          // Deactivate subscription entitlements
          const { error } = await supabase
            .from("entitlements")
            .update({ active: false })
            .eq("user_id", customer.user_id)
            .in("product_code", ["prism_beta_monthly", "prism_beta_annual"]);

          if (error) {
            console.error("Failed to deactivate subscription:", error);
          }
        }
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed":
        console.log(`Invoice event: ${event.type}`, event.data.object.id);
        // TODO: Send email notifications, update payment status
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    });
  }
});
