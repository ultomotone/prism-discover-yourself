import { useEffect } from "react";
import { trackEvent } from "@/utils/analytics";

interface CalEmbedProps {
  slug: string;
}

const CalEmbed = ({ slug }: CalEmbedProps) => {
  useEffect(() => {
    trackEvent("booking_page_view", { slug });
    const handler = (event: MessageEvent) => {
      if (event.origin !== "https://cal.com") return;
      trackEvent("booking_event", { slug, data: event.data });
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [slug]);

  return (
    <iframe
      src={`https://cal.com/daniel-speiss/${slug}?embed=iframe`}
      title={`Schedule ${slug}`}
      className="w-full min-h-screen border-0"
      allow="payment"
    />
  );
};

export default CalEmbed;
