import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
    consent: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              Get in touch
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-2xl mx-auto">
              Questions, partnerships, or team inquiries—send a note and we'll respond promptly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-primary font-medium">Name *</Label>
                    <Input 
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-primary font-medium">Email *</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="organization" className="text-primary font-medium">Organization (optional)</Label>
                    <Input 
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => handleInputChange("organization", e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-primary font-medium">Message *</Label>
                    <Textarea 
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      className="mt-2 min-h-32"
                      required
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="consent"
                      checked={formData.consent}
                      onCheckedChange={(checked) => handleInputChange("consent", checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
                      I consent to having my information processed according to the privacy policy and used to respond to my inquiry.
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    disabled={!formData.consent}
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="prism-shadow-card">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-primary mb-6">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-secondary mr-3" />
                      <div>
                        <p className="font-medium text-primary">Email</p>
                        <p className="text-muted-foreground">daniel.joseph.speiss@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-secondary mr-3" />
                      <div>
                        <p className="font-medium text-primary">Phone</p>
                        <p className="text-muted-foreground">631-745-8686</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-secondary mr-3" />
                      <div>
                        <p className="font-medium text-primary">Location</p>
                        <p className="text-muted-foreground">San Francisco, CA</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="prism-shadow-card">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-primary mb-4">Response Time</h3>
                  <p className="text-muted-foreground mb-4">
                    We typically respond to inquiries within 24 hours during business days.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    For urgent team inquiries, please mention "URGENT" in your subject line.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;