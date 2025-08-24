import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Linkedin, Twitter, Facebook } from "lucide-react";
import { useEffect } from "react";

const Footer = () => {
  // Load Stripe script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const popularLinks = {
    components: [
      { name: "Information Elements", href: "/signals" },
      { name: "Core Alignments", href: "/core-alignments" },
      { name: "Dimensionality", href: "/dimensionality" },
      { name: "Block Dynamics", href: "/blocks" },
      { name: "State Overlay", href: "/state-overlay" },
    ],
    support: [
      { name: "FAQ", href: "/faq" },
      { name: "Research", href: "/research" },
      { name: "Contact Us", href: "/contact" },
      { name: "Accessibility", href: "/accessibility" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="prism-container">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3">
                  <span className="text-primary font-bold text-lg">P</span>
                </div>
                <span className="text-2xl font-bold">PRISM</span>
              </div>
              <p className="text-primary-foreground/80 mb-6">
                Empowering individuals and teams through scientifically-backed 
                personality insights.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-primary-foreground/60" />
                  <span className="text-primary-foreground/80 text-sm">daniel.joseph.speiss@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-primary-foreground/60" />
                  <span className="text-primary-foreground/80 text-sm">631-745-8686</span>
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

            {/* PRISM Components Column */}
            <div>
              <h3 className="font-semibold mb-4">PRISM Components</h3>
              <ul className="space-y-2">
                {popularLinks.components.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-primary-foreground/80 hover:text-primary-foreground prism-transition">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/resources" className="text-primary-foreground/80 hover:text-primary-foreground prism-transition">
                    Resources
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="text-primary-foreground/80 hover:text-primary-foreground prism-transition">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/roadmap" className="text-primary-foreground/80 hover:text-primary-foreground prism-transition">
                    Roadmap
                  </a>
                </li>
                <li>
                  <a href="https://chatgpt.com/g/g-68a233600af0819182cfa8c558a63112-prism-personality-ai-coach" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground prism-transition">
                    PRISM AI Coach
                  </a>
                </li>
                {popularLinks.support.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-primary-foreground/80 hover:text-primary-foreground prism-transition">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support PRISM Column */}
            <div>
              <h3 className="font-semibold mb-4">Support PRISM</h3>
              <div 
                dangerouslySetInnerHTML={{
                  __html: `<stripe-buy-button
                    buy-button-id="buy_btn_1RxsnID9AJFeFtOvkMbrRpMA"
                    publishable-key="pk_live_q3JAuI9omI8O6TFmtfpQyq0p">
                  </stripe-buy-button>`
                }}
              />
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
              {popularLinks.legal.map((link) => (
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