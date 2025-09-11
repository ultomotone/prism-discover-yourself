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
    q: "Will this be a sales pitch?",
    a: "No. It’s a 20-minute decision session to choose the right path or refer you out.",
  },
  {
    q: "Do we need the team present?",
    a: "Not for this call. We’ll tell you exactly who to involve next.",
  },
  {
    q: "What do I leave with?",
    a: "A concise plan, priority metric, and a link to book the next step with your credit applied.",
  },
];

export default function TeamsPage() {
  const options = useMemo(() => SERVICES.filter((s) => s.scope === "teams"), []);
  const startService = options[0];
  const paths = options.slice(1);
  const [selected, setSelected] = useState<Service>(startService);

  const serviceJsonLd = useMemo(() => buildServiceJsonLd(selected), [selected]);
  const faqJsonLd = buildFaqJsonLd(FAQS);

  const primaryCtaClass =
    "inline-flex items-center justify-center rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";
  const secondaryCtaClass =
    "inline-flex items-center justify-center rounded-xl border border-indigo-600 bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";
  const linkCtaClass = "text-sm text-slate-600 underline";

  return (
    <PageShell
      title="Start Here: 20-Minute Owner/Leader Discovery"
      subtitle="Founders, execs, team leads—decide your fastest path. Use your $49 credit on the next step."
      cta={
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="#book" className={primaryCtaClass}>
            Book Owner/Leader Discovery (20m)
          </a>
          <a href="#services" className={secondaryCtaClass}>
            View Team & Leadership Programs
          </a>
          <a
            href="mailto:team@prismpersonality.com?subject=Owner%2FLeader%20One-Pager"
            className={linkCtaClass}
          >
            Send me the one-pager
          </a>
        </div>
      }
    >
      {/* Start Here card */}
      <section aria-label="Start Here" className="mb-8">
        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
          <p className="text-sm font-semibold">
            Purpose: business outcomes (team alignment, leadership leverage, near-term performance)
          </p>
          <div className="mt-4">
            <h2 className="text-base font-semibold">In 20 minutes we will:</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
              <li>Define your #1 business outcome</li>
              <li>
                Confirm fit + prioritize the path: Team Compass Workshop, Leader
                Coaching & Training, or Team Performance Sprint
              </li>
            </ul>
          </div>
          <div className="mt-4">
            <h2 className="text-base font-semibold">You leave with:</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
              <li>
                Written recommendation + next-step link with $49 credit applied
                at checkout
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Body sections */}
      <section aria-label="Who it's for" className="mb-6">
        <h2 className="text-base font-semibold">Who it’s for</h2>
        <p className="mt-2 text-sm text-slate-700">
          Owners/leaders choosing between team and leadership packages—or
          sequencing both for maximum ROI.
        </p>
      </section>

      <section aria-label="What happens in 20 minutes" className="mb-6">
        <h2 className="text-base font-semibold">What happens in 20 minutes</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>Snapshot: goals, constraints, timeline (5 mins)</li>
          <li>Diagnose: team vs. leader leverage point (10 mins)</li>
          <li>Decide: best first move + metric to track (5 mins)</li>
        </ol>
      </section>

      <section aria-label="What you'll leave with" className="mb-6">
        <h2 className="text-base font-semibold">What you’ll leave with</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Written recommendation</li>
          <li>Next-step link with $49 credit applied</li>
        </ul>
      </section>

      <section aria-label="Not sure where to begin?" id="decision" className="mb-6">
        <h2 className="text-base font-semibold">Not sure where to begin?</h2>
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          <li className="rounded-2xl border bg-white p-3 text-sm shadow-sm">
            “Misaligned roles, meetings drift, unclear priorities” →
            <span className="font-semibold"> Team Compass Workshop</span>
          </li>
          <li className="rounded-2xl border bg-white p-3 text-sm shadow-sm">
            “High personal load, delegation gaps, feedback loops weak” →
            <span className="font-semibold"> Leader Coaching & Training</span>
          </li>
          <li className="rounded-2xl border bg-white p-3 text-sm shadow-sm">
            “Revenue stall, missed deadlines, handoff friction” →
            <span className="font-semibold"> Team Performance Sprint</span>
          </li>
        </ul>
      </section>

      {/* Services grid */}
      <section aria-label="Services for teams" id="services" className="mb-8">
        <h2 className="mb-3 text-sm font-semibold">Skip to a program</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              selected={selected.id === svc.id}
              onSelect={setSelected}
            />
          ))}
        </div>
      </section>

      <section aria-label="Where this leads" className="mb-8">
        <h2 className="text-base font-semibold">Where this leads</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Direct link to the recommended engagement</li>
          <li>$49 credit auto-applied at checkout</li>
          <li>
            If not a fit, you’ll get a candid referral; credit stays on file
          </li>
        </ul>
      </section>

      <section aria-label="FAQs" className="mb-10">
        <h2 className="text-base font-semibold">FAQs</h2>
        <dl className="mt-2 space-y-4">
          {FAQS.map((f, i) => (
            <div key={i}>
              <dt className="text-sm font-medium text-slate-900">{f.q}</dt>
              <dd className="mt-1 text-sm text-slate-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

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

