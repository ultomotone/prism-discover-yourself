import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IndividualsSection from "@/components/IndividualsSection";
import PrismModel from "@/components/PrismModel";
import BookSection from "@/components/BookSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <PrismModel />
        <IndividualsSection />
        <BookSection />
      </main>
    </div>
  );
};

export default Index;
