import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IndividualsSection from "@/components/IndividualsSection";
import TeamsSection from "@/components/TeamsSection";
import PrismModel from "@/components/PrismModel";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <PrismModel />
        <IndividualsSection />
        <TeamsSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
