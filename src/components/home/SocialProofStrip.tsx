import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SocialProofStrip = () => {
  const navigate = useNavigate();

  return (
    <section className="prism-section">
      <div className="prism-container max-w-4xl">
        <Card className="border-2 border-muted">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
              <p className="text-lg text-muted-foreground">
                Used by teams and creators exploring high-resolution type.
              </p>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/methods-accuracy')}
              className="text-primary hover:underline"
            >
              Methods & Accuracy →
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SocialProofStrip;
