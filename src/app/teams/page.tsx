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
import { Helmet } from "react-helmet";

const FAQS_T = [
  {
    q: "What will I leave with?",
    a: "A clear next-step program, a 30–90 day plan, and team/leader-specific playbooks.",
  },
  {
    q: "How soon do I see ROI?",
    a: "Most teams feel alignment within 30 days; sprints target cycle-time reductions in 60 days.",
  },
  {
    q: "What’s the reschedule/no-show policy?",
    a: "Discovery credits apply if you book within 7 days. Reschedule ≥24h; no-show forfeits credit.",
  },
];

export default function TeamsPage() {
  const options = useMemo(() => SERVICES.filter((s) => s.scope === "teams"), []);
  const [selected, setSelected] = useState<Service>(options[0]);

  const serviceJsonLd = useMemo(() => buildServiceJsonLd(selected), [selected]);
  const faqJsonLd = buildFaqJsonLd(FAQS_T);

  return (
    <PageShell
      title="Prism Personality — Teams"
      subtitle="Alignment you can feel in 30 days. Persona-tuned playbooks that speed cycles."
    >
      {/* How it works */}
      <section aria-label="How it works" className="mb-8">
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            { t: "Assess", d: "Team signals and goals." },
            { t: "Map", d: "Roles, rules, rhythms." },
            { t: "Act", d: "Sprint the next 30 days." },
          ].map((s, i) => (
            <li key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold">{s.t}</div>
              <p className="text-sm text-slate-700">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Services grid */}
      <section aria-label="Services for teams" className="mb-10">
        <div className="mb-3 text-sm font-semibold">Pick a service</div>
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

      <SchedulerEmbed service={selected} />

      {/* SEO JSON-LD */}
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
    </PageShell>
  );
}

