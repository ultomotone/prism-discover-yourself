import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CalInline from "@/components/CalInline";
import { getServiceBySlug } from "@/data/services";
import NotFound from "./NotFound";

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = getServiceBySlug(slug || "");

  if (!service) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="prism-container max-w-3xl mx-auto">
          <h1 className="prism-heading-lg text-primary mb-6">{service.title}</h1>
          <p className="prism-body text-muted-foreground mb-8">{service.summary}</p>
          <ul className="space-y-2 mb-8 list-disc pl-5">
            {service.bullets.map((b) => (
              <li key={b} className="prism-body text-muted-foreground">
                {b}
              </li>
            ))}
          </ul>
          <div className="mb-4" data-analytics="prism_service_book_widget">
            <CalInline calLink={service.calLink} selector="#cal-service" />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Bookings are processed securely via Cal.com; availability updates live.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
