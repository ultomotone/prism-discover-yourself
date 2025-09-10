"use client";

import { SERVICES } from "@/data/services";
import { ServiceCard } from "@/components/ServiceCard";
import { PageShell } from "@/app/(marketing)/_components/PageShell";

export default function TeamsPage() {
  const options = SERVICES.filter((s) => s.scope === "teams");

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
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

