"use client";

import React from "react";
import type { Service } from "@/data/services";

export function ServiceCard({ service }: { service: Service }) {
  const slug = service.id.split("/").pop() ?? "";
  const scopePath = service.scope === "individuals" ? "individuals" : "organizations";
  const href = `/solutions/${scopePath}/${slug}`;

  return (
    <article
      className="flex h-full flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
    >
      <div>
        <h3 className="text-base font-semibold leading-snug">{service.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
          <span className="rounded-full border px-2 py-0.5">{service.duration}</span>
          <span className="rounded-full border px-2 py-0.5">{service.price}</span>
        </div>
        <ul className="mt-3 list-inside list-disc text-sm text-slate-700">
          {service.deliverables.slice(0, 3).map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">ROI: {service.roi}</span>
        <a
          href={href}
          className="inline-flex items-center justify-center rounded-xl border border-indigo-600 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Learn more
        </a>
      </div>
    </article>
  );
}

