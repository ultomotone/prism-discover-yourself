import "./setup/dom";

import test, { afterEach, beforeEach } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import TypingLabEntry from "../src/pages/TypingLabEntry";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { TypingLabEntry as TypingLabEntryType } from "../src/features/typing-lab/types";
import { typingLabEntries } from "../src/features/typing-lab/data";
import { __typingLabLikesTestUtils } from "../src/features/typing-lab/hooks/useTypingLabLikes";

const buildEntry = (overrides: Partial<TypingLabEntryType> = {}): TypingLabEntryType => ({
  slug: overrides.slug ?? "test-entry",
  name: overrides.name ?? "Test Entry",
  role: overrides.role ?? "Researcher",
  domain: overrides.domain ?? "Scientist",
  era: overrides.era ?? "2020s",
  nationality: overrides.nationality ?? "American",
  proposedType: overrides.proposedType ?? "LII",
  overlay: overrides.overlay,
  confidenceBand: overrides.confidenceBand ?? "High",
  top2Gap: overrides.top2Gap ?? 0.4,
  altTypes:
    overrides.altTypes ?? [
      { type: "LIE", weight: 0.28, note: "Alternative cluster" },
      { type: "ILE", weight: 0.22, note: "Ideation-focused" },
    ],
  summary: overrides.summary ?? "Test summary for the typing dossier.",
  rationale: overrides.rationale ?? "Test rationale for the typing dossier.",
  differentiator: overrides.differentiator ?? "Test differentiator copy.",
  functionMap:
    overrides.functionMap ?? {
      Ti: { dim: 4, str: "H", note: "Sharp analytic structure." },
      Te: { dim: 1, str: "L", note: "Light operational focus." },
      Fi: { dim: 1, str: "L", note: "Low-values broadcast." },
      Fe: { dim: 2, str: "M", note: "Moderate interpersonal expression." },
      Ni: { dim: 3, str: "H", note: "Future-planning focus." },
      Ne: { dim: 2, str: "M", note: "Exploratory when pressure is low." },
      Si: { dim: 1, str: "L", note: "Limited comfort orientation." },
      Se: { dim: 1, str: "L", note: "Low force deployment." },
    },
  contexts:
    overrides.contexts ?? {
      flow: "Flow context placeholder.",
      performative: "Performative context placeholder.",
      stress: "Stress context placeholder.",
    },
  contextBalance:
    overrides.contextBalance ?? {
      flow: 0.35,
      performative: 0.33,
      stress: 0.32,
    },
  evidence:
    overrides.evidence ?? [
      {
        claim: "Test claim for evidence.",
        source: { kind: "article", url: "https://example.com", label: "Example Source" },
        interpretation: "Test interpretation.",
        weight: "Strong",
      },
    ],
  differentials: overrides.differentials ?? [{ type: "ILE", whyNot: "Differential placeholder." }],
  falsification: overrides.falsification ?? ["Falsification placeholder."],
  coachingSnapshot: overrides.coachingSnapshot ?? ["Coaching placeholder."],
  ethicsNote: overrides.ethicsNote ?? "Educational; non-clinical.",
  versionLog: overrides.versionLog ?? [{ date: "2025-01-01", change: "Initial publish." }],
  lastUpdated: overrides.lastUpdated ?? "2025-01-01",
  dataCoverage: overrides.dataCoverage ?? 3,
  futureResearch: overrides.futureResearch,
  counterevidenceLog: overrides.counterevidenceLog,
  faq: overrides.faq,
  image: overrides.image,
  featured: overrides.featured,
  debated: overrides.debated,
  overlayExplanation: overrides.overlayExplanation,
  confidenceExplanation: overrides.confidenceExplanation,
  states: overrides.states,
  readingGuide: overrides.readingGuide,
  assessmentMap: overrides.assessmentMap,
});

beforeEach(() => {
  typingLabEntries.splice(0, typingLabEntries.length);
  __typingLabLikesTestUtils.reset();
  if (typeof window !== "undefined") {
    window.localStorage.clear();
  }
});

afterEach(() => {
  cleanup();
});

test("renders a typing dossier with function map and evidence", async () => {
  typingLabEntries.push(buildEntry());

  render(
    <MemoryRouter initialEntries={["/typing-lab/test-entry"]}>
      <Routes>
        <Route path="/typing-lab/:slug" element={<TypingLabEntry />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByRole("heading", { name: /Test Entry/i });
  await screen.findByText(/Function expression map/i);
  await screen.findByText(/Evidence ledger/i);
  await screen.findByText(/Differential diagnosis/i);
  await screen.findByRole("button", { name: /Give a thumbs up to the Test Entry typing dossier/i });
  await screen.findByRole("link", { name: /Share on LinkedIn/i });
});

test("renders fallback when dossier missing", async () => {
  render(
    <MemoryRouter initialEntries={["/typing-lab/unknown-figure"]}>
      <Routes>
        <Route path="/typing-lab/:slug" element={<TypingLabEntry />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/Typing not found/i);
  await screen.findByRole("link", { name: /Back to Typing Lab/i });
});
