import Header from "@/components/Header";
import CalEmbed from "@/components/CalEmbed";

const Component = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <div className="pt-24 prism-container">
      <CalEmbed slug="team-performance-sprint-4-950-mo-8-12-people-2-months" />
    </div>
  </div>
);

export default Component;
