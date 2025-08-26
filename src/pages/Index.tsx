import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IndividualsSection from "@/components/IndividualsSection";
import PrismModel from "@/components/PrismModel";
import BookSection from "@/components/BookSection";
import YourPersonalityBlueprintModal from "@/components/YourPersonalityBlueprintModal";
import { useYPBModal } from "@/hooks/useYPBModal";

const Index = () => {
  const { isOpen, closeModal } = useYPBModal();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <PrismModel />
        <IndividualsSection />
        <BookSection />
      </main>
      
      {/* Your Personality Blueprint Modal */}
      <YourPersonalityBlueprintModal 
        isOpen={isOpen} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default Index;
