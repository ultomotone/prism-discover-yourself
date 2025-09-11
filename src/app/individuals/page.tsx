"use client";

import React, { useMemo, useState } from "react";
import { SERVICES, type Service } from "@/data/services";
import SchedulerEmbed from "@/components/SchedulerEmbed";
import { ServiceCard } from "@/components/ServiceCard";
import { PageShell } from "@/app/(marketing)/_components/PageShell";
import {
  buildServiceJsonLd,
  buildFaqJsonLd,
} from "@/app/(marketing)/_components/jsonld";

const FAQS = [
  {
    q: "What will I leave with?",
    a: "A 1-page action map, next 7 days of prompts, and a clear next step tied to your #1 outcome.",
  },
  {
    q: "How soon do I see ROI?",
    a: "Most sessions drive a measurable shift within 7–30 days. Discovery calls give immediate direction in 10–15 minutes.",
  },
  {
    q: "What's the reschedule/no-show policy?",
    a: "Reschedule ≥24h in advance. Discovery credits apply if you book within 7 days. No-shows forfeit credit.",
  },
];

export default function IndividualsPage() {
  const options = useMemo(
    () => SERVICES.filter((s) => s.scope === "individuals"),
    []
  );
  const [selected, setSelected] = useState<Service>(options[1] || options[0]);

  const serviceJsonLd = useMemo(() => buildServiceJsonLd(selected), [selected]);
  const faqJsonLd = buildFaqJsonLd(FAQS);

  return (
    <PageShell
      title="Prism Personality — Individuals"
      subtitle="Clarity fast. PRISM-backed sessions that translate into action in 7–30 days."
    >
      {/* How it works */}
      <section aria-label="How it works" className="mb-8">
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            { t: "Assess", d: "Quick signal from your PRISM." },
            { t: "Map", d: "Lock strengths and friction." },
            { t: "Act", d: "Book the next best step." },
          ].map((s, i) => (
            <li key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold">{s.t}</div>
              <p className="text-sm text-slate-700">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Recommended Starting Point */}
      <section aria-label="Recommended starting point" className="mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">🌟 Recommended Starting Point</h3>
          <p className="text-sm text-slate-600 mt-1">Not sure which service fits? Start here to get personalized guidance.</p>
        </div>
        {(() => {
          const discoveryService = options.find(s => s.id.includes('personal-discovery'));
          return discoveryService ? (
            <ServiceCard
              key={discoveryService.id}
              service={discoveryService}
              selected={selected.id === discoveryService.id}
              onSelect={setSelected}
            />
          ) : null;
        })()}
      </section>

      {/* All Services */}
      <section aria-label="All services for individuals" className="mb-10">
        <div className="mb-3 text-sm font-semibold">All Services</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              selected={selected.id === svc.id}
              onSelect={setSelected}
            />
          ))}
        </div>
      </section>

      {/* Selected service + embed */}
      <SchedulerEmbed service={selected} />

      {/* SEO JSON-LD - inject into head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </PageShell>
  );
}