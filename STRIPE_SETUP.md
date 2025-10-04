# Stripe Integration Setup Guide

## Overview
Complete Stripe billing integration for PRISM Personality using Supabase Edge Functions.

## Architecture
- **Database**: `stripe_customers` table maps users to Stripe customer IDs
- **Edge Functions**: 4 Deno functions handle webhooks, portal, and checkout
- **Security**: RLS policies, JWT auth, webhook signature verification

---

## 1. Required Supabase Secrets

Add these in **Supabase Dashboard → Settings → Edge Functions**:

```bash
STRIPE_SECRET_KEY=sk_live_...              # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...            # Get after creating webhook endpoint
STRIPE_PRICE_BETA_MONTHLY=price_...        # Monthly subscription price ID
STRIPE_PRICE_BETA_ANNUAL=price_...         # Annual subscription price ID
STRIPE_PRICE_BETA_LIFETIME=price_...       # Lifetime one-time payment price ID
STRIPE_PRICE_ADVANCED=price_...            # Advanced pack one-time payment price ID
APP_URL=https://app.prismpersonality.com   # Your app URL for redirects
```

---

## 2. Get Stripe Price IDs

From your existing Stripe products:

1. Go to **Stripe Dashboard → Products**
2. Click on each product (Beta Monthly, Beta Annual, Beta Lifetime, Advanced Pack)
3. Copy the **Price ID** (starts with `price_...`)
4. Add to Supabase secrets above

---

## 3. Configure Stripe Webhook

### Create Endpoint

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://gnkuikentdtnatazeriu.functions.supabase.co/stripe-webhook`
   - **Payload style**: **Thin** (recommended for performance)
   - **API version**: `2025-09-30.clover`
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

4. **Copy the Signing secret** (starts with `whsec_...`)
5. Add as `STRIPE_WEBHOOK_SECRET` in Supabase secrets
6. Redeploy edge functions (they auto-deploy on git push)

---

## 4. Configure Customer Portal

1. Go to **Stripe Dashboard → Settings → Billing → Customer portal**
2. Enable the portal
3. Configure allowed actions:
   - ✅ Update payment method
   - ✅ View invoices
   - ✅ Cancel subscription
4. Set **Return URL**: `https://app.prismpersonality.com/account/billing`

---

## 5. Edge Functions Reference

### `stripe-webhook` (POST)
- **Purpose**: Receives Stripe events and fulfills purchases
- **Auth**: None (verified via Stripe signature)
- **Actions**:
  - Maps users to Stripe customers
  - Grants/updates/deactivates entitlements
  - Logs events to console

### `stripe-portal` (POST)
- **Purpose**: Generates Customer Portal URL
- **Auth**: Required (JWT)
- **Request**: None
- **Response**: `{ url: "https://billing.stripe.com/..." }`

### `checkout-membership` (POST)
- **Purpose**: Creates checkout for Beta Membership
- **Auth**: Required (JWT)
- **Request**: `{ plan: "monthly" | "annual" | "lifetime", resultId?: "uuid" }`
- **Response**: `{ url: "https://checkout.stripe.com/..." }`

### `checkout-advanced` (POST)
- **Purpose**: Creates checkout for Advanced Pack
- **Auth**: Required (JWT)
- **Request**: `{ resultId: "uuid" }`
- **Response**: `{ url: "https://checkout.stripe.com/..." }`

---

## 6. Frontend Integration Examples

### Membership Checkout Button

```typescript
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

function MembershipButton({ plan }: { plan: "monthly" | "annual" | "lifetime" }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("checkout-membership", {
        body: { plan, resultId: "optional_result_id" }
      });

      if (error) throw error;
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
    } catch (err: any) {
      toast({
        title: "Checkout Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? "Loading..." : `Subscribe ${plan}`}
    </Button>
  );
}
```

### Customer Portal Link

```typescript
async function openBillingPortal() {
  const { data, error } = await supabase.functions.invoke("stripe-portal");
  
  if (error) {
    console.error("Portal error:", error);
    return;
  }
  
  window.open(data.url, "_blank");
}
```

### Check User Entitlements

```typescript
async function checkMembership() {
  const { data: entitlements, error } = await supabase
    .from("entitlements")
    .select("*")
    .eq("active", true)
    .in("product_code", [
      "prism_beta_monthly",
      "prism_beta_annual",
      "prism_beta_lifetime"
    ]);

  const hasMembership = entitlements && entitlements.length > 0;
  return hasMembership;
}
```

---

## 7. Testing

### Local Testing (Stripe CLI)

```bash
# Forward webhooks to local function
stripe listen --forward-to https://gnkuikentdtnatazeriu.functions.supabase.co/stripe-webhook

# Trigger test event
stripe trigger checkout.session.completed
```

### Production Testing Checklist

1. ✅ Test membership checkout → verify Stripe redirect
2. ✅ Complete payment → check webhook logs in Supabase
3. ✅ Verify `stripe_customers` table has new user mapping
4. ✅ Verify `entitlements` table has `active=true` row
5. ✅ Test Customer Portal → verify URL generation
6. ✅ Test subscription update → verify `active` status changes
7. ✅ Test subscription cancel → verify `active=false`

---

## 8. Security Checklist

✅ **RLS enabled** on `stripe_customers` and `entitlements`  
✅ **Webhook signature verification** prevents spoofed events  
✅ **Service role** used only in webhook for DB writes  
✅ **JWT auth required** for all user-facing endpoints  
✅ **User isolation** via `auth.uid()` in RLS policies  
✅ **No client secrets** (all Stripe operations server-side)

---

## 9. Product Codes Reference

| Product Code              | Description                  | Type         |
|---------------------------|------------------------------|--------------|
| `prism_beta_monthly`      | Monthly Beta Membership      | Subscription |
| `prism_beta_annual`       | Annual Beta Membership       | Subscription |
| `prism_beta_lifetime`     | Lifetime Beta Membership     | One-time     |
| `prism_advanced_pack`     | Advanced Results Pack        | One-time     |

---

## 10. Troubleshooting

**Webhook not receiving events?**
- Verify endpoint URL in Stripe Dashboard
- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- View logs: Supabase Dashboard → Edge Functions → stripe-webhook

**"No Stripe customer found" error?**
- User needs to complete at least one purchase first
- Check `stripe_customers` table for user_id

**Checkout URL not redirecting?**
- Verify all `STRIPE_PRICE_*` secrets are set
- Check `APP_URL` is correct
- View logs in Supabase Edge Functions

---

## Deployment Complete ✅

All functions are automatically deployed when you push to git. No manual deployment needed.
