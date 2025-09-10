import Header from "@/components/Header";
import CalEmbed from "@/components/CalEmbed";

const Component = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="pt-24 prism-container">
      <CalEmbed slug="team-compass-workshop-group-up-to-8" />
    </div>
  </div>
);

export default Component;
