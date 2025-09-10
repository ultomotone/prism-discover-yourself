import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IndividualsSection from "@/components/IndividualsSection";
import PrismModel from "@/components/PrismModel";
import BookSection from "@/components/BookSection";
import YourPersonalityBlueprintModal from "@/components/YourPersonalityBlueprintModal";
import NewsletterSignupModal from "@/components/NewsletterSignupModal";
import { useYPBModal } from "@/hooks/useYPBModal";
import { useNewsletterModal } from "@/hooks/useNewsletterModal";

const Index = () => {
  const { isOpen, closeModal } = useYPBModal();
  const { isOpen: isNewsletterOpen, closeModal: closeNewsletterModal } = useNewsletterModal();

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
      
      {/* Newsletter Signup Modal */}
      <NewsletterSignupModal 
        isOpen={isNewsletterOpen} 
        onClose={closeNewsletterModal} 
      />
    </div>
  );
};

export default Index;
