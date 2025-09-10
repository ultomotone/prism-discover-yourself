"use client";

import React from "react";
import type { Service } from "@/data/services";

export function ServiceCard({
  service,
  selected = false,
  onSelect,
}: {
  service: Service;
  selected?: boolean;
  onSelect: (s: Service) => void;
}) {
  const handleClick = () => {
    onSelect(service);
    const el = document.getElementById("book");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <article
      className={`flex h-full flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5 ${
        selected ? "ring-2 ring-indigo-500" : ""
      }`}
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
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center justify-center rounded-xl border border-indigo-600 bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          aria-label={`Book ${service.title}`}
        >
          Book
        </button>
      </div>
    </article>
  );
}

