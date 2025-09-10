import Header from "@/components/Header";
import CalEmbed from "@/components/CalEmbed";

const Component = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="pt-24 prism-container">
      <CalEmbed slug="personality-mapping-call" />
    </div>
  </div>
);

export default Component;
