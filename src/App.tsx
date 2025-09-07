import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import History from "./pages/History";
import UserDashboard from "./pages/UserDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Signals from "./pages/Signals";
import Ti from "./pages/Ti";
import Te from "./pages/Te";
import Fi from "./pages/Fi";
import Fe from "./pages/Fe";
import Ni from "./pages/Ni";
import Ne from "./pages/Ne";
import Si from "./pages/Si";
import Se from "./pages/Se";
import Dimensionality from "./pages/Dimensionality";
import Blocks from "./pages/Blocks";
import StateOverlay from "./pages/StateOverlay";
import HowItWorks from "./pages/HowItWorks";
import Profiles from "./pages/Profiles";
import Individuals from "./pages/Individuals";
import Teams from "./pages/Teams";
import Consultants from "./pages/Consultants";
import Education from "./pages/Education";
import Insights from "./pages/Insights";
import Research from "./pages/Research";
import FirstHundredStudy from "./pages/FirstHundredStudy";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Accessibility from "./pages/Accessibility";
import CoreAlignments from "./pages/CoreAlignments";
import Resources from "./pages/Resources";
import NotFound from "./pages/NotFound";
// PRISM Type imports
import IdeaCatalyst from "./pages/types/IdeaCatalyst";
import FrameworkArchitect from "./pages/types/FrameworkArchitect";
import ComfortHarmonizer from "./pages/types/ComfortHarmonizer";
import AtmosphereHost from "./pages/types/AtmosphereHost";
import TacticalCommander from "./pages/types/TacticalCommander";
import SystemsMarshal from "./pages/types/SystemsMarshal";
import VisionMuse from "./pages/types/VisionMuse";
import InspirationOrchestrator from "./pages/types/InspirationOrchestrator";
import StrategicExecutor from "./pages/types/StrategicExecutor";
import ForesightAnalyst from "./pages/types/ForesightAnalyst";
import RelationalDriver from "./pages/types/RelationalDriver";
import BoundaryGuardian from "./pages/types/BoundaryGuardian";
import OperationsSteward from "./pages/types/OperationsSteward";
import PracticalOptimizer from "./pages/types/PracticalOptimizer";
import PossibilityConnector from "./pages/types/PossibilityConnector";
import IntegrityGuide from "./pages/types/IntegrityGuide";
import Roadmap from "./pages/Roadmap";
import Admin from "./pages/Admin";
import YourPersonalityBlueprint from "./pages/YourPersonalityBlueprint";
import PRISMRelationalFit from "./pages/PRISMRelationalFit";
import RelationalFitHome from "./pages/relational-fit/RelationalFitHome";
import RelationalFitHeatmap from "./pages/relational-fit/RelationalFitHeatmap";
import RelationalFitTypes from "./pages/relational-fit/RelationalFitTypes";
import RelationalFitPair from "./pages/relational-fit/RelationalFitPair";
import ContinueSession from "./pages/ContinueSession";

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("🚨 React Error Boundary caught an error:", error);
    console.error("🚨 Error name:", error.name);
    console.error("🚨 Error message:", error.message);
    console.error("🚨 Error stack:", error.stack);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 Error Boundary Details:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
    
    // Log to help identify the problematic component
    console.error("🚨 Component Stack (shows which component failed):");
    console.error(errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              The page encountered an error and couldn't load properly.
            </p>
            {this.state.error && (
              <details className="mb-4 text-left text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Error details (for debugging)
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
            <div className="space-y-2">
              <button
                className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
              >
                Reload Page
              </button>
              <a
                href="/"
                className="block w-full px-4 py-2 border border-border rounded hover:bg-muted text-center"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/assessment" element={<Assessment />} />
                  <Route path="/continue/:sessionId" element={<ContinueSession />} />
                  <Route path="/results/:sessionId" element={<Results />} />
                  {/* Debug route for Results testing */}
                  <Route path="/results" element={
                    <div className="min-h-screen bg-background flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Results Page - Missing Session ID</h1>
                        <p className="text-muted-foreground mb-4">You need a session ID to view results</p>
                        <Button onClick={() => window.location.href = '/'}>Go Home</Button>
                      </div>
                    </div>
                  } />
                  <Route path="/history" element={<History />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/signals" element={<Signals />} />
                  <Route path="/ti" element={<Ti />} />
                  <Route path="/te" element={<Te />} />
                  <Route path="/fi" element={<Fi />} />
                  <Route path="/fe" element={<Fe />} />
                  <Route path="/ni" element={<Ni />} />
                  <Route path="/ne" element={<Ne />} />
                  <Route path="/si" element={<Si />} />
                  <Route path="/se" element={<Se />} />
                  <Route path="/dimensionality" element={<Dimensionality />} />
                  <Route path="/blocks" element={<Blocks />} />
                  <Route path="/state-overlay" element={<StateOverlay />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/profiles" element={<Profiles />} />
                  <Route path="/individuals" element={<Individuals />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/consultants" element={<Consultants />} />
                  <Route path="/education" element={<Education />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/research" element={<Research />} />
                  <Route path="/research/first-hundred-study" element={<FirstHundredStudy />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/accessibility" element={<Accessibility />} />
                  <Route path="/core-alignments" element={<CoreAlignments />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/roadmap" element={<Roadmap />} />
                  <Route path="/your-personality-blueprint" element={<YourPersonalityBlueprint />} />
                  <Route path="/prism-relational-fit" element={<PRISMRelationalFit />} />
                  
                  {/* Relational Fit Mini-App Routes */}
                  <Route path="/relational-fit" element={<RelationalFitHome />} />
                  <Route path="/relational-fit/heatmap" element={<RelationalFitHeatmap />} />
                  <Route path="/relational-fit/types" element={<RelationalFitTypes />} />
                  <Route path="/relational-fit/pair/:pairId" element={<RelationalFitPair />} />
                  {/* PRISM Type Routes */}
                  <Route path="/types/idea-catalyst" element={<IdeaCatalyst />} />
                  <Route path="/types/framework-architect" element={<FrameworkArchitect />} />
                  <Route path="/types/comfort-harmonizer" element={<ComfortHarmonizer />} />
                  <Route path="/types/atmosphere-host" element={<AtmosphereHost />} />
                  <Route path="/types/tactical-commander" element={<TacticalCommander />} />
                  <Route path="/types/systems-marshal" element={<SystemsMarshal />} />
                  <Route path="/types/vision-muse" element={<VisionMuse />} />
                  <Route path="/types/inspiration-orchestrator" element={<InspirationOrchestrator />} />
                  <Route path="/types/strategic-executor" element={<StrategicExecutor />} />
                  <Route path="/types/foresight-analyst" element={<ForesightAnalyst />} />
                  <Route path="/types/relational-driver" element={<RelationalDriver />} />
                  <Route path="/types/boundary-guardian" element={<BoundaryGuardian />} />
                  <Route path="/types/operations-steward" element={<OperationsSteward />} />
                  <Route path="/types/practical-optimizer" element={<PracticalOptimizer />} />
                  <Route path="/types/possibility-connector" element={<PossibilityConnector />} />
                  <Route path="/types/integrity-guide" element={<IntegrityGuide />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
