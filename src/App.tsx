import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🚨 Error Boundary Details:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/results/:sessionId" element={<Results />} />
                <Route path="/history" element={<History />} />
                <Route path="/dashboard" element={<Dashboard />} />
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
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/accessibility" element={<Accessibility />} />
                <Route path="/core-alignments" element={<CoreAlignments />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/roadmap" element={<Roadmap />} />
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
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
