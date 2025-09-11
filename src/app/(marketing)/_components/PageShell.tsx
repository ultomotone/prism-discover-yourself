"use client";

import React, { PropsWithChildren, ReactNode } from "react";

export function PageShell({
  title,
  subtitle,
  cta,
  children,
}: PropsWithChildren<{ title: string; subtitle: string; cta?: ReactNode }>) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <header className="mb-8 sm:mb-12">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-slate-700">{subtitle}</p>
        {cta}
      </header>
      {children}
    </main>
  );
}

