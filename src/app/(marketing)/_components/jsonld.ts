export function buildServiceJsonLd(service: import("@/data/services").Service) {
  const priceNumber = Number(service.price.replace(/[^0-9.]/g, "")) || 0;
  const ld: any = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    areaServed: "US",
    serviceType: inferServiceType(service),
    provider: {
      "@type": "Person",
      name: "Daniel Speiss",
    },
    offers: {
      "@type": "Offer",
      price: priceNumber,
      priceCurrency: "USD",
      url: `${process.env.NEXT_PUBLIC_SCHED_BASE || "https://calendly.com"}/${service.id}`,
      availability: "https://schema.org/InStock",
    },
    description: service.description,
  };
  return ld;
}

export function buildFaqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function inferServiceType(service: import("@/data/services").Service) {
  // Try to get a concise type from title e.g., "Personality Mapping", "Compatibility Debrief"
  const title = service.title;
  const patterns: Record<string, string> = {
    "Personality Mapping": "Mapping",
    "Compatibility Debrief": "Compatibility Debrief",
    "Career Clarity": "Career Clarity Mapping",
    "Progress Retake": "Progress Retake & Tune-Up",
    "Owner/Leader Discovery": "Owner/Leader Discovery",
    "Team Compass": "Team Compass Workshop",
    "Leadership Debrief": "Leadership Debrief",
    "Sales Persona": "Sales Persona Play",
    "Manager: Coaching": "Manager Coaching by Persona",
    "Hiring Fit": "Hiring Fit Screen",
    "Leader Coaching & Training": "Leader Coaching & Training",
    "Team Performance Sprint": "Team Performance Sprint",
    "Applied Personality Lab": "Applied Personality Lab Onboarding",
  };
  for (const k of Object.keys(patterns)) if (title.includes(k)) return patterns[k];
  return title;
}

