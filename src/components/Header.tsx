import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "About PRISM", href: "/about" },
    { name: "For Individuals", href: "/individuals" },
    { name: "For Teams", href: "/teams" },
    { name: "Blog & Insights", href: "/insights" },
    { name: "Resources", href: "/faq" },
  ];

  const prismComponents = [
    { name: "Information Elements", href: "/signals" },
    { name: "Ti - Framework Builder", href: "/ti" },
    { name: "Te - Efficiency Driver", href: "/te" },
    { name: "Fi - Inner Compass", href: "/fi" },
    { name: "Fe - Social Conductor", href: "/fe" },
    { name: "Ni - Pattern Forecaster", href: "/ni" },
    { name: "Ne - Possibility Explorer", href: "/ne" },
    { name: "Si - Steward of Experience", href: "/si" },
    { name: "Se - Real-Time Mover", href: "/se" },
    { name: "Dimensionality", href: "/dimensionality" },
    { name: "Block Dynamics", href: "/blocks" },
    { name: "State Overlay", href: "/state-overlay" },
    { name: "Assessment Methods", href: "/assessment-methods" },
    { name: "Accuracy & Privacy", href: "/accuracy-privacy" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="prism-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 prism-gradient-hero rounded-md flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-primary">PRISM</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary prism-transition font-medium"
              >
                {item.name}
              </a>
            ))}
            
            {/* PRISM Components Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary prism-transition font-medium">
                  PRISM Components
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border border-border shadow-lg z-50">
                <DropdownMenuItem asChild>
                  <a href="/signals" className="w-full">Information Elements Overview</a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {prismComponents.slice(1, 9).map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <a href={item.href} className="w-full">{item.name}</a>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {prismComponents.slice(9).map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <a href={item.href} className="w-full">{item.name}</a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform', '_blank')}
            >
              Take Assessment
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-foreground hover:text-primary prism-transition font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              
              {/* PRISM Components in Mobile */}
              <div className="border-t border-border mt-2 pt-2">
                <div className="px-3 py-1 text-sm font-semibold text-muted-foreground">PRISM Components</div>
                {prismComponents.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-sm text-foreground hover:text-primary prism-transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              
              <div className="px-3 py-2">
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform', '_blank')}
                >
                  Take Assessment
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;