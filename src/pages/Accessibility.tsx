import { Card, CardContent } from "@/components/ui/card";
import { Eye, Ear, Navigation, Mail } from "lucide-react";
import Header from "@/components/Header";

const Accessibility = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              Accessibility Statement
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-2xl mx-auto">
              We strive for WCAG 2.1 AA compliance. If you encounter barriers, contact us and we'll help.
            </p>
          </div>

          <div className="space-y-8">
            {/* Our Commitment */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Eye className="h-6 w-6 text-secondary mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Our Commitment</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  PRISM is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Keyboard navigation support
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Screen reader compatibility
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    High contrast color schemes
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Scalable text and interface elements
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Visual Accessibility */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Eye className="h-6 w-6 text-accent mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Visual Accessibility</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Color contrast ratios meet WCAG AA standards
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Text alternatives for images and graphics
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Clear visual hierarchy and readable fonts
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Information conveyed through more than color alone
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Audio & Motor Accessibility */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Ear className="h-6 w-6 text-warm mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Audio & Motor Accessibility</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    No auto-playing audio content
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Generous click targets for easier interaction
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Reasonable time limits with extension options
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-warm rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Alternative input methods supported
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Navigation & Structure */}
            <Card className="prism-shadow-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Navigation className="h-6 w-6 text-primary mr-3" />
                  <h2 className="text-2xl font-semibold text-primary">Navigation & Structure</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Consistent navigation patterns across pages
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Logical heading structure and landmarks
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Descriptive link text and button labels
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 prism-gradient-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Focus indicators for keyboard navigation
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Need Help? */}
            <Card className="prism-gradient-secondary text-white prism-shadow-card">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 mr-3" />
                  <h2 className="text-2xl font-semibold">Need assistance?</h2>
                </div>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  If you encounter any accessibility barriers while using our website or taking the PRISM assessment, please don't hesitate to reach out. We're here to help ensure everyone can access our services.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold">Contact our accessibility team:</p>
                  <p className="text-white/90">accessibility@prismassessment.com</p>
                  <p className="text-white/90">+1 (555) 123-4567</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;