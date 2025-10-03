import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShieldAlert, Clock, Scale, AlertTriangle, Shield, Mail, Info } from "lucide-react";
import Header from "@/components/Header";

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              Refund Policy (No Refunds)
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-2xl mx-auto">
              All sales are final. Because our products are digital and/or grant immediate access to features, we do not offer refunds once an order is completed.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              <em>Effective date: December 2024 | Applies to: purchases made on prismpersonality.com and via PRISM Dynamics™ checkout links.</em>
            </p>
          </div>

          <div className="space-y-8">
            {/* Summary */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <DollarSign className="h-6 w-6 text-primary mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Summary</h2>
                </div>
                <p className="text-muted-foreground">
                  All sales are final. Because our products are digital and/or grant immediate access to features, we do not offer refunds once an order is completed.
                </p>
              </CardContent>
            </Card>

            {/* What This Covers */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <ShieldAlert className="h-6 w-6 text-secondary mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">What This Covers</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    PRISM Assessment & Advanced Report Pack (digital reports, analytics, retake credits)
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    PRISM Dynamics Beta Membership (community access, trials, features, discounts)
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Any other electronic services, downloads, or credits sold by PRISM Dynamics
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Cancellations */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Clock className="h-6 w-6 text-warm mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Cancellations (for memberships)</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    You may cancel future renewals at any time in your account or by contacting us.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Cancellation stops the next billing cycle; past charges are not refundable.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Lifetime/one-time purchases are non-cancelable and non-refundable after payment.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Exceptions Required by Law */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Scale className="h-6 w-6 text-accent mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Exceptions Required by Law</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  If your local law provides a mandatory cooling-off or refund right for digital services, we will honor it to the minimum extent required. Where allowed, we begin fulfillment immediately and you waive any cooling-off period at checkout when you access the product.
                </p>
              </CardContent>
            </Card>

            {/* Billing Issues We Will Fix */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <AlertTriangle className="h-6 w-6 text-warm mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Billing Issues We Will Fix (not refunds)</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  We'll promptly credit or correct the following if they occur:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Duplicate charges or accidental double purchases
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Obvious processing errors (e.g., charged but no access provisioned)
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Fraudulent/unauthorized use of your card once verified
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Chargebacks */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Shield className="h-6 w-6 text-primary mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Chargebacks</h2>
                </div>
                <p className="text-muted-foreground">
                  Please contact us first to resolve any issue. Unauthorized chargebacks for valid, delivered digital services may result in suspension of access and may be contested with evidence (access logs, downloads, timestamps).
                </p>
              </CardContent>
            </Card>

            {/* How to Reach Us */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Mail className="h-6 w-6 text-secondary mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">How to Reach Us</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <strong>Email:</strong> <a href="mailto:team@prismpersonality.com" className="text-primary hover:underline">team@prismpersonality.com</a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <strong>Subject:</strong> Billing — Refund Policy
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <strong>Include:</strong> order email, order ID/last 4 digits, and a brief description
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Changes to Policy & Checkout Acknowledgment */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Info className="h-6 w-6 text-accent mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Changes to This Policy</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  We may update this policy from time to time. The "Effective date" above reflects the latest version. Policy in force at the time of your purchase applies to that purchase.
                </p>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <h3 className="font-semibold text-primary mb-2">Checkout Acknowledgment</h3>
                  <p className="text-sm text-muted-foreground">
                    By completing this purchase, you agree that all sales are final and non-refundable, and for memberships you may cancel future renewals at any time.
                  </p>
                </div>

                <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                  <h3 className="font-semibold text-primary mb-2">Customer Portal Note</h3>
                  <p className="text-sm text-muted-foreground">
                    You can cancel to stop future charges. Past payments are non-refundable. Access remains active until the end of the paid term.
                  </p>
                </div>

                <p className="text-sm text-muted-foreground text-center mt-6">
                  Last updated: December 2024
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
