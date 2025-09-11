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
    q: "Why a credit?",
    a: "To turn this into action—not notes. Your $29 carries forward to your next step.",
  },
  {
    q: "Can I jump straight to a full session?",
    a: "Yes. Use the decision helper to pick, or start here and we’ll route you.",
  },
  {
    q: "Is this therapy?",
    a: "No—this is structured decision support and coaching.",
  },
];

export default function IndividualsPage() {
  const options = useMemo(
    () => SERVICES.filter((s) => s.scope === "individuals"),
    []
  );
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
      title="Start Here: 20-Minute Personal Discovery"
      subtitle="Get one clear next step for life decisions—then use your $29 credit on the recommended session."
      cta={
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="#book" className={primaryCtaClass}>
            Book Personal Discovery (20m)
          </a>
          <a href="#services" className={secondaryCtaClass}>
            Browse Services
          </a>
          <a
            href="mailto:team@prismpersonality.com?subject=Personal%20Discovery%20Question"
            className={linkCtaClass}
          >
            Still unsure? Ask a question
          </a>
        </div>
      }
    >
      {/* Start Here card */}
      <section aria-label="Start Here" className="mb-8">
        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
          <p className="text-sm font-semibold">
            Purpose: non-business clarity (dating, conflict → calm, career)
          </p>
          <div className="mt-4">
            <h2 className="text-base font-semibold">In 20 minutes we will:</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
              <li>Pinpoint your #1 outcome</li>
              <li>
                Choose the fastest path: Personality Mapping, Compatibility
                Debrief, Conflict→Calm, or Career Clarity
              </li>
            </ul>
          </div>
          <div className="mt-4">
            <h2 className="text-base font-semibold">You leave with:</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
              <li>
                Written recommendation + direct booking link with $29 credit
                pre-applied
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Body sections */}
      <section aria-label="Who it's for" className="mb-6">
        <h2 className="text-base font-semibold">Who it’s for</h2>
        <p className="mt-2 text-sm text-slate-700">
          People who want a neutral, structured sounding board to make a
          personal call—fast.
        </p>
      </section>

      <section aria-label="What happens in 20 minutes" className="mb-6">
        <h2 className="text-base font-semibold">What happens in 20 minutes</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>Quick intake (2–3 mins)</li>
          <li>Clarify the situation + outcome (10 mins)</li>
          <li>Map to the best path (5 mins)</li>
          <li>Confirm fit + next step (2–3 mins)</li>
        </ol>
      </section>

      <section aria-label="What you'll leave with" className="mb-6">
        <h2 className="text-base font-semibold">What you’ll leave with</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Written recommendation</li>
          <li>Direct booking link with $29 credit pre-applied</li>
        </ul>
      </section>

      <section
        aria-label="Not sure where to begin?"
        id="decision"
        className="mb-6"
      >
        <h2 className="text-base font-semibold">Not sure where to begin?</h2>
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          <li className="rounded-2xl border bg-white p-3 text-sm shadow-sm">
            “I keep repeating patterns in dating” →
            <span className="font-semibold"> Compatibility Debrief</span>
          </li>
          <li className="rounded-2xl border bg-white p-3 text-sm shadow-sm">
            “We’re stuck in the same argument” →
            <span className="font-semibold"> Conflict→Calm</span>
          </li>
          <li className="rounded-2xl border bg-white p-3 text-sm shadow-sm">
            “I don’t know my strengths or blind spots” →
            <span className="font-semibold"> Personality Mapping</span>
          </li>
          <li className="rounded-2xl border bg-white p-3 text-sm shadow-sm">
            “I’m between roles or tracks” →
            <span className="font-semibold"> Career Clarity</span>
          </li>
        </ul>
      </section>

      {/* Services grid */}
      <section aria-label="Services for individuals" id="services" className="mb-8">
        <h2 className="mb-3 text-sm font-semibold">Skip to a path</h2>
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
          <li>Instant booking link for your recommended session</li>
          <li>$29 credit auto-applied at checkout</li>
          <li>
            If the fit isn’t right, you’ll get a referral and keep your credit
            on file
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

