"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Service } from "@/data/services";

const PROVIDER = (
  process.env.NEXT_PUBLIC_SCHED_PROVIDER || "calendly"
).toLowerCase() as "calendly" | "savvycal" | "tidycal";

const BASE = process.env.NEXT_PUBLIC_SCHED_BASE || "https://calendly.com";

// Module-level guards to prevent duplicate script loads per page
const scriptLoaded: Record<string, boolean> = { calendly: false, savvycal: false };

function loadScriptOnce(src: string, key: "calendly" | "savvycal") {
  return new Promise<void>((resolve, reject) => {
    if (scriptLoaded[key]) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      scriptLoaded[key] = true;
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

export default function SchedulerEmbed({ service }: { service: Service }) {
  const url = useMemo(() => `${BASE}/${service.id}`, [service.id]);
  const [ready, setReady] = useState(PROVIDER === "tidycal");
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    async function init() {
      try {
        if (PROVIDER === "calendly") {
          await loadScriptOnce(
            "https://assets.calendly.com/assets/external/widget.js",
            "calendly"
          );
        } else if (PROVIDER === "savvycal") {
          await loadScriptOnce("https://embed.savvycal.com/v1/embed.js", "savvycal");
        }
      } finally {
        // Small delay to avoid layout jank as widget hydrates
        setTimeout(() => mounted.current && setReady(true), 250);
      }
    }
    if (!ready) init();
    return () => {
      mounted.current = false;
    };
  }, [ready]);

  return (
    <section aria-label={`${service.title} — Scheduler`} className="w-full" id="book">
      {/* Selected service info */}
      <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">{service.title}</h2>
          <p className="text-sm text-slate-600">{service.tagline}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-700">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5">{service.duration}</span>
            <span className="inline-flex items-center rounded-full border px-2 py-0.5">{service.price}</span>
            <span className="inline-flex items-center rounded-full border px-2 py-0.5">ROI: {service.roi}</span>
          </div>
          <p className="mt-2 text-slate-700">{service.description}</p>
        </div>
      </div>

      {/* Widget container */}
      <div className="relative w-full min-h-[720px] rounded-2xl border bg-white shadow-sm">
        {!ready && (
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />
        )}
        <div className={ready ? "block" : "invisible"}>
          {PROVIDER === "calendly" && (
            <div
              key={service.id}
              className="calendly-inline-widget"
              data-url={url}
              style={{ minHeight: 720 }}
              aria-label={service.title}
            />
          )}
          {PROVIDER === "savvycal" && (
            <div
              key={service.id}
              className="sc-widget"
              data-src={url}
              style={{ minHeight: 720 }}
              aria-label={service.title}
            />
          )}
          {PROVIDER === "tidycal" && (
            <iframe
              key={service.id}
              title={service.title}
              src={url}
              className="h-[720px] w-full rounded-2xl"
              aria-label={service.title}
            />
          )}
        </div>
        <noscript>
          <div className="p-4 text-sm">
            JavaScript is required to load the scheduler.
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline"
            >
              Open the booking page in a new tab.
            </a>
          </div>
        </noscript>
      </div>
    </section>
  );
}

