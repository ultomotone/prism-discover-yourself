import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { prismTypes } from "@/data/prismTypes";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  const navigation = [
    { name: "About", href: "/about" },
  ];

  const solutionsItems = [
    { name: "Individuals", href: "/individuals" },
    { name: "Organizations", href: "/teams" },
    { name: "Consultants", href: "/consultants" },
    { name: "Education", href: "/education" },
  ];

  const prismComponents = [
    { name: "Information Elements", href: "/signals" },
    { name: "Ti - Structural Logic", href: "/ti" },
    { name: "Te - Pragmatic Logic", href: "/te" },
    { name: "Fi - Relational Ethics", href: "/fi" },
    { name: "Fe - Interpersonal Dynamics", href: "/fe" },
    { name: "Ni - Convergent Synthesis", href: "/ni" },
    { name: "Ne - Divergent Exploration", href: "/ne" },
    { name: "Si - Experiential Memory", href: "/si" },
    { name: "Se - Kinesthetic Responsiveness", href: "/se" },
    { name: "Core Alignments", href: "/core-alignments" },
    { name: "Dimensionality", href: "/dimensionality" },
    { name: "Block Dynamics", href: "/blocks" },
    { name: "State Overlay", href: "/state-overlay" },
    { name: "Relational Fit", href: "/prism-relational-fit" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="prism-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 prism-transition">
            <div className="w-8 h-8 prism-gradient-hero rounded-md flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-primary">PRISM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/assessment"
              className="text-foreground hover:text-primary prism-transition font-medium"
            >
              Assessment
            </Link>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary prism-transition font-medium"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Solutions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary prism-transition font-medium">
                  Solutions
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-background border border-border shadow-lg z-50">
                {solutionsItems.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link to={item.href} className="w-full">{item.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* PRISM Types Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary prism-transition font-medium">
                  PRISM Types
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border border-border shadow-lg z-50 max-h-96 overflow-y-auto">
                {prismTypes.map((type) => (
                  <DropdownMenuItem key={type.code} asChild>
                    <Link to={`/types/${type.slug}`} className="w-full">
                      <div className="flex flex-col">
                        <div className="font-medium">{type.code} - {type.publicArchetype}</div>
                        <div className="text-xs text-muted-foreground">{type.baseCreative}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
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
                  <Link to="/signals" className="w-full">Information Elements Overview</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {prismComponents.slice(1, 9).map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link to={item.href} className="w-full">{item.name}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {prismComponents.slice(9).map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link to={item.href} className="w-full">{item.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.email?.split('@')[0]}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="w-full">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="hero" 
                    size="lg"
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </Button>
                </div>
              )
            )}
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
              <Link
                to="/assessment"
                className="block px-3 py-2 text-foreground hover:text-primary prism-transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Assessment
              </Link>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-foreground hover:text-primary prism-transition font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Solutions in Mobile */}
              <div className="border-t border-border mt-2 pt-2">
                <div className="px-3 py-1 text-sm font-semibold text-muted-foreground">Solutions</div>
                {solutionsItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-sm text-foreground hover:text-primary prism-transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* PRISM Types in Mobile */}
              <div className="border-t border-border mt-2 pt-2">
                <div className="px-3 py-1 text-sm font-semibold text-muted-foreground">PRISM Types</div>
                {prismTypes.map((type) => (
                  <Link
                    key={type.code}
                    to={`/types/${type.slug}`}
                    className="block px-3 py-2 text-sm text-foreground hover:text-primary prism-transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {type.code} - {type.publicArchetype}
                  </Link>
                ))}
              </div>
              
              {/* PRISM Components in Mobile */}
              <div className="border-t border-border mt-2 pt-2">
                <div className="px-3 py-1 text-sm font-semibold text-muted-foreground">PRISM Components</div>
                {prismComponents.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-sm text-foreground hover:text-primary prism-transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              
              <div className="px-3 py-2 space-y-2">
                {!loading && (
                  user ? (
                    <>
                      <Link
                        to="/dashboard"
                        className="block px-3 py-2 text-foreground hover:text-primary prism-transition font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          navigate('/login');
                          setIsMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="hero" 
                        className="w-full"
                        onClick={() => {
                          navigate('/signup');
                          setIsMenuOpen(false);
                        }}
                      >
                        Get Started
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;