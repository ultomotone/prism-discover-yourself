"use client";

import React, { PropsWithChildren } from "react";

export function PageShell({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <header className="mb-8 sm:mb-12">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-slate-700">{subtitle}</p>
      </header>
      {children}
    </main>
  );
}

