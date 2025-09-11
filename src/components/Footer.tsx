import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Linkedin, Twitter, Facebook } from "lucide-react";

const Footer = () => {

  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribed:", email);
    setEmail("");
  };

  const popularLinks = {
    components: [
      { name: "Information Elements", href: "/signals" },
      { name: "Core Alignments", href: "/core-alignments" },
      { name: "Dimensionality", href: "/dimensionality" },
      { name: "Block Dynamics", href: "/blocks" },
      { name: "State Overlay", href: "/state-overlay" },
      { name: "Relationship Fit", href: "/relational-fit" },
    ],
    support: [
      { name: "FAQ", href: "/faq" },
      { name: "Research", href: "/research" },
      { name: "Contact Us", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-indigo-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        
        {/* About PRISM */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="bg-white text-indigo-900 font-bold rounded w-6 h-6 flex items-center justify-center">P</div>
              <h2 className="font-bold text-lg">PRISM</h2>
            </a>
          </div>
          <p className="mb-4 text-gray-300">
            Empowering individuals and teams through scientifically-backed personality insights.
          </p>
          <div className="space-y-2 text-gray-400">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <a href="mailto:team@prismpersonality.com">team@prismpersonality.com</a>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>(631) 745-8686</span>
            </div>
          </div>
        </div>

        {/* PRISM Components */}
        <div>
          <h3 className="font-semibold mb-4">PRISM Components</h3>
          <ul className="space-y-2 text-gray-300">
            {popularLinks.components.map((link) => (
              <li key={link.name}>
                <a href={link.href} className="hover:text-white transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold mb-4">Resources</h3>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="/real-time-type" className="hover:text-white transition-colors">
                Real-time Type
              </a>
            </li>
            <li>
              <a href="/roadmap" className="hover:text-white transition-colors">
                Roadmap
              </a>
            </li>
            {popularLinks.support.map((link) => (
              <li key={link.name}>
                <a href={link.href} className="hover:text-white transition-colors">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Stay Connected */}
        <div>
          <h3 className="font-semibold mb-4">Stay Connected</h3>
          <div className="mb-4">
            <form onSubmit={handleSubscribe} className="flex space-x-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white text-indigo-900 placeholder-gray-500 focus:outline-none border-none"
                required
              />
              <Button 
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded"
              >
                Subscribe
              </Button>
            </form>
          </div>
          <div className="flex space-x-4 text-gray-400 mt-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white p-0"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white p-0"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white p-0"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-4 text-gray-300">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).rdtTrack) {
                  (window as any).rdtTrack('Custom', { custom_event_name: 'DonateClick' });
                }
                if (typeof window !== 'undefined' && (window as any).fbTrack) {
                  (window as any).fbTrack('Custom', { custom_event_name: 'DonateClick' });
                }
                window.open('https://donate.stripe.com/3cI6oHdR3cLg4n0eK56Ri04', '_blank');
              }}
              className="hover:underline"
            >
              Donate via Stripe
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-xs mt-12">
        © 2025 PRISM. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
