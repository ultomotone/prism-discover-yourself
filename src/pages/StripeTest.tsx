import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";

const StripeTest = () => {
  const [loading, setLoading] = useState(false);
  const [checkoutType, setCheckoutType] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleTestCheckout = async (type: 'advanced' | 'membership') => {
    try {
      setLoading(true);
      setCheckoutType(type);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to test checkout");
        navigate('/auth');
        return;
      }

      // Call the appropriate checkout function
      const functionName = type === 'advanced' ? 'checkout-advanced' : 'checkout-membership';
      const body = type === 'advanced' 
        ? { resultId: 'test-result-id' }
        : { plan: 'monthly' };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        toast.success("Checkout opened in new tab");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setLoading(false);
      setCheckoutType(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">Stripe Test Environment</h1>
          <p className="text-muted-foreground">Test your Stripe integration with test cards</p>
        </div>

        {/* Test Cards Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Test Card Numbers
            </CardTitle>
            <CardDescription>
              Use these test cards to simulate payments (use any future expiry date and any 3-digit CVC)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-mono text-sm font-semibold">4242 4242 4242 4242</p>
                  <p className="text-sm text-muted-foreground">Success - Payment succeeds</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-mono text-sm font-semibold">4000 0025 0000 3155</p>
                  <p className="text-sm text-muted-foreground">Requires authentication (3D Secure)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-mono text-sm font-semibold">4000 0000 0000 9995</p>
                  <p className="text-sm text-muted-foreground">Declined - Insufficient funds</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-2">More test cards:</p>
              <a 
                href="https://docs.stripe.com/testing#cards" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View full list on Stripe docs →
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Test Checkout Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Test Checkout</CardTitle>
            <CardDescription>
              Click a button to start a test checkout session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                size="lg"
                onClick={() => handleTestCheckout('advanced')}
                disabled={loading}
                className="h-24 flex-col gap-2"
              >
                {loading && checkoutType === 'advanced' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Advanced Pack</div>
                      <div className="text-xs opacity-80">One-time payment</div>
                    </div>
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleTestCheckout('membership')}
                disabled={loading}
                className="h-24 flex-col gap-2"
              >
                {loading && checkoutType === 'membership' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">Beta Membership</div>
                      <div className="text-xs opacity-80">Monthly subscription</div>
                    </div>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Info */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Status</CardTitle>
            <CardDescription>
              Your webhook endpoint is configured at:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm">
                https://gnkuikentdtnatazeriu.supabase.co/functions/v1/stripe-webhook
              </code>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              When a test payment completes, the webhook will:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Create/update customer record in stripe_customers table</li>
              <li>Grant entitlement in entitlements table</li>
              <li>Log the event for debugging</li>
            </ul>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Testing Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Make sure you're signed in (test will redirect to auth if not)</li>
              <li>Click one of the checkout buttons above</li>
              <li>Use a test card number (e.g., 4242 4242 4242 4242)</li>
              <li>Complete the checkout in the new tab</li>
              <li>Check the Supabase tables to verify:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-muted-foreground">
                  <li><code>stripe_customers</code> - Customer mapping created</li>
                  <li><code>entitlements</code> - Access granted</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StripeTest;
