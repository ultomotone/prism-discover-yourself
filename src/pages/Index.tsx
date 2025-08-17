import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IndividualsSection from "@/components/IndividualsSection";
import TeamsSection from "@/components/TeamsSection";
import PrismModel from "@/components/PrismModel";
import BookSection from "@/components/BookSection";
import Testimonials from "@/components/Testimonials";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <PrismModel />
        <IndividualsSection />
        <TeamsSection />
        <BookSection />
        <Testimonials />
      </main>
    </div>
  );
};

export default Index;
