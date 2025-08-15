import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
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
import AssessmentMethods from "./pages/AssessmentMethods";
import AccuracyPrivacy from "./pages/AccuracyPrivacy";
import HowItWorks from "./pages/HowItWorks";
import Profiles from "./pages/Profiles";
import Individuals from "./pages/Individuals";
import Teams from "./pages/Teams";
import Insights from "./pages/Insights";
import Research from "./pages/Research";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Accessibility from "./pages/Accessibility";
import Quadras from "./pages/Quadras";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
              <Route path="/assessment-methods" element={<AssessmentMethods />} />
              <Route path="/accuracy-privacy" element={<AccuracyPrivacy />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/profiles" element={<Profiles />} />
              <Route path="/individuals" element={<Individuals />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/research" element={<Research />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/quadras" element={<Quadras />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
