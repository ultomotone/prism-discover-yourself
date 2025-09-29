import { Helmet } from "react-helmet";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Disambiguation = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Helmet
        title="Not Affiliated with Other PRISM Assessments | PRISM Dynamics™"
        meta={[
          { 
            name: "description", 
            content: "PRISM Dynamics is a distinct model and product, not affiliated with PRISM Brain Mapping, SurePeople, or other PRISM-named tools."
          }
        ]}
      />
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="prism-container max-w-4xl">
          <Alert className="mb-8 border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-base">
              <strong>Important:</strong> PRISM Dynamics™ is not affiliated with other PRISM assessments.
            </AlertDescription>
          </Alert>

          <h1 className="prism-heading-xl mb-6">
            Not affiliated with other PRISM assessments
          </h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>We are a distinct product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="prism-body">
                <strong>PRISM Dynamics™</strong> is a distinct model and product. We are not:
              </p>
              <ul className="list-disc list-inside space-y-2 prism-body text-muted-foreground ml-4">
                <li>PRISM Brain Mapping</li>
                <li>SurePeople</li>
                <li>Any other PRISM-named personality or assessment tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What makes PRISM Dynamics unique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="prism-body">
                Our system focuses on:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <strong>Information Elements</strong> — Eight elements that drive how you take in and act on information
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <strong>Dimensionality (1D–4D)</strong> — Your operating range across contexts
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <strong>Block Dynamics (Flow vs Pressure)</strong> — How your pattern shifts under stress
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                  <div>
                    <strong>Linguistic Signals</strong> — Markers that reveal information processing patterns
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="prism-body mb-4">
                If you have questions about PRISM Dynamics or need clarification about our approach, 
                please contact our support team.
              </p>
              <Button onClick={() => navigate("/contact")}>
                Contact Support
              </Button>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Disambiguation;
