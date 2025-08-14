import { Card, CardContent } from "@/components/ui/card";
import { Shield, Database, Trash2, Eye } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              Privacy Policy
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              <em>Note: This is starter copy—have counsel review for legal compliance.</em>
            </p>
          </div>

          <div className="space-y-8">
            {/* Data Collection */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Database className="h-6 w-6 text-secondary mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">What we collect</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    We collect responses to generate your PRISM profile.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Optional research items are anonymized and aggregated.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Contact information when you reach out to us.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Eye className="h-6 w-6 text-accent mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">How we use your data</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    To generate and deliver your personalized PRISM profile.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    To improve our assessment methods and accuracy.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    To respond to your inquiries and provide support.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Shield className="h-6 w-6 text-warm mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Data protection</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    We don't sell personal data to third parties.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Your assessment responses are stored securely and confidentially.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Research data is aggregated and anonymized before analysis.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Trash2 className="h-6 w-6 text-primary mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Your rights</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    You can request deletion of your personal data at any time.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    You can access and update your information by contacting us.
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    You can opt out of research participation at any time.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-primary mb-4">Questions about privacy?</h3>
                <p className="text-muted-foreground mb-4">
                  Contact us at privacy@prismassessment.com for any privacy-related questions or requests.
                </p>
                <p className="text-sm text-muted-foreground">
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

export default Privacy;