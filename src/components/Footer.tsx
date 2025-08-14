import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    product: [
      { name: "Assessment", href: "#assessment" },
      { name: "For Individuals", href: "#individuals" },
      { name: "For Teams", href: "#teams" },
      { name: "Pricing", href: "#pricing" },
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Research", href: "#research" },
      { name: "Case Studies", href: "#cases" },
      { name: "Careers", href: "#careers" },
    ],
    resources: [
      { name: "Blog", href: "#blog" },
      { name: "Download Center", href: "#downloads" },
      { name: "Support", href: "#support" },
      { name: "FAQ", href: "#faq" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Cookie Policy", href: "#cookies" },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="prism-container">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3">
                  <span className="text-primary font-bold text-lg">P</span>
                </div>
                <span className="text-2xl font-bold">PRISM</span>
              </div>
              <p className="text-primary-foreground/80 mb-6 max-w-md">
                Empowering individuals and teams through scientifically-backed 
                personality insights. Discover your authentic self and unlock 
                your full potential.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-primary-foreground/60" />
                  <span className="text-primary-foreground/80">hello@prismassessment.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-primary-foreground/60" />
                  <span className="text-primary-foreground/80">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-3 text-primary-foreground/60" />
                  <span className="text-primary-foreground/80">San Francisco, CA</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10">
                  <Facebook className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Link Columns */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-primary-foreground/80 hover:text-primary-foreground prism-transition">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-primary-foreground/80 hover:text-primary-foreground prism-transition">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-primary-foreground/80 hover:text-primary-foreground prism-transition">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-primary-foreground/20" />

        {/* Bottom Footer */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-primary-foreground/60 text-sm">
              © 2024 PRISM Personality System. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {footerLinks.legal.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-primary-foreground/60 hover:text-primary-foreground text-sm prism-transition"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;