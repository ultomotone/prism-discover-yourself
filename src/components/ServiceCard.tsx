import { Link } from "react-router-dom";
import { Service } from "@/data/services";
import { Button } from "@/components/ui/button";

interface Props {
  service: Service;
}

export const ServiceCard = ({ service }: Props) => (
  <div className="rounded-2xl border p-6 hover:shadow-md focus-within:ring-2">
    <h3 className="text-xl font-semibold">{service.title}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{service.summary}</p>
    <ul className="mt-3 space-y-1 text-sm list-disc pl-5">
      {service.bullets.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
    <div className="mt-4">
      <Button asChild data-analytics="prism_service_learn_more_click">
        <Link to={`/solutions/${service.audience}/${service.slug}`}>Explore</Link>
      </Button>
    </div>
  </div>
);

export default ServiceCard;
