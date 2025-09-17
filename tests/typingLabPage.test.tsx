import "./setup/dom";

import test, { afterEach, beforeEach } from "node:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import TypingLab from "../src/pages/TypingLab";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import type { TypingLabEntry } from "../src/features/typing-lab/types";
import { typingLabEntries } from "../src/features/typing-lab/data";
import { __typingLabLikesTestUtils } from "../src/features/typing-lab/hooks/useTypingLabLikes";

const buildEntry = (overrides: Partial<TypingLabEntry> = {}): TypingLabEntry => ({
  slug: overrides.slug ?? `test-${Math.random().toString(36).slice(2)}`,
  name: overrides.name ?? "Test Figure",
  role: overrides.role ?? "Researcher",
  domain: overrides.domain ?? "Scientist",
  era: overrides.era ?? "2020s",
  nationality: overrides.nationality ?? "American",
  proposedType: overrides.proposedType ?? "LII",
  overlay: overrides.overlay,
  confidenceBand: overrides.confidenceBand ?? "Medium",
  top2Gap: overrides.top2Gap ?? 0.24,
  altTypes:
    overrides.altTypes ?? [
      { type: "LIE", weight: 0.32, note: "Alternative evidence cluster" },
      { type: "ILE", weight: 0.21, note: "Occasional ideation bursts" },
    ],
  summary: overrides.summary ?? "Summary placeholder for testing.",
  rationale: overrides.rationale ?? "Rationale placeholder for testing.",
  differentiator: overrides.differentiator ?? "Differentiator placeholder for testing.",
  functionMap:
    overrides.functionMap ?? {
      Ti: { dim: 4, str: "H", note: "Precise internal structuring." },
      Te: { dim: 1, str: "L", note: "Keeps execution lightweight." },
      Fi: { dim: 1, str: "L", note: "Values held privately." },
      Fe: { dim: 2, str: "M", note: "Moderate broadcast when needed." },
      Ni: { dim: 3, str: "H", note: "Tracks trajectories over time." },
      Ne: { dim: 2, str: "M", note: "Explores options when stakes are low." },
      Si: { dim: 1, str: "L", note: "Defers comfort considerations." },
      Se: { dim: 1, str: "L", note: "Low direct pressure." },
    },
  contexts:
    overrides.contexts ?? {
      flow: "Flow context placeholder.",
      performative: "Performative context placeholder.",
      stress: "Stress context placeholder.",
    },
  contextBalance:
    overrides.contextBalance ?? {
      flow: 0.34,
      performative: 0.33,
      stress: 0.33,
    },
  evidence:
    overrides.evidence ?? [
      {
        claim: "Claim placeholder.",
        source: { kind: "article", url: "https://example.com", label: "Example Source" },
        interpretation: "Interpretation placeholder.",
        weight: "Moderate",
      },
    ],
  differentials: overrides.differentials ?? [{ type: "ILE", whyNot: "Why not placeholder." }],
  falsification: overrides.falsification ?? ["Falsification placeholder."],
  coachingSnapshot: overrides.coachingSnapshot ?? ["Coaching snapshot placeholder."],
  ethicsNote: overrides.ethicsNote ?? "Educational; non-clinical.",
  versionLog: overrides.versionLog ?? [{ date: "2025-01-01", change: "Initial publish." }],
  lastUpdated: overrides.lastUpdated ?? "2025-01-01",
  dataCoverage: overrides.dataCoverage ?? 2,
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

const renderWithRouter = (initialEntries: string[] = ["/typing-lab"]) => {
  const router = createMemoryRouter(
    [
      {
        path: "/typing-lab",
        element: <TypingLab />,
      },
    ],
    { initialEntries }
  );

  render(<RouterProvider router={router} />);

  return router;
};

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

test("renders Typing Lab hero with social share controls and empty state", async () => {
  renderWithRouter();

  await screen.findByRole("heading", {
    name: /Typing Lab: Evidence-based hypotheses of famous figures/i,
  });

  await screen.findByRole("button", { name: /Give a thumbs up to the Typing Lab/i });
  await screen.findByRole("link", { name: /Share on LinkedIn/i });
  await screen.findByText(/No typings match your filters yet/i);
});

test("filters entries via search and debated toggle", async () => {
  typingLabEntries.push(
    buildEntry({ slug: "debated-entry", name: "Debated Example", debated: true, domain: "Artist" }),
    buildEntry({ slug: "steady-entry", name: "Steady Example", debated: false, domain: "Scientist" })
  );

  const router = renderWithRouter();

  await screen.findByText(/Debated Example/i);
  await screen.findByText(/Steady Example/i);

  const search = await screen.findByLabelText(/search/i);
  fireEvent.change(search, { target: { value: "Debated" } });

  await screen.findByText(/Debated Example/i);
  const hidden = screen.queryByText(/Steady Example/i);
  if (hidden) {
    throw new Error("Steady Example should be filtered out by the search term");
  }

  await waitFor(() => {
    expect(router.state.location.search).toContain("search=Debated");
  });

  fireEvent.change(search, { target: { value: "" } });

  const debatedSwitch = await screen.findByRole("switch", {
    name: /toggle most debated typings/i,
  });
  fireEvent.click(debatedSwitch);

  await waitFor(() => {
    expect(router.state.location.search).toContain("debated=1");
  });

  const absentSteady = screen.queryByText(/Steady Example/i);
  if (absentSteady) {
    throw new Error("Steady Example should be hidden when only debated entries show");
  }

  const clearButton = await screen.findByRole("button", { name: /clear filters/i });
  fireEvent.click(clearButton);

  await waitFor(() => {
    expect(router.state.location.search).toBe("");
  });
});

test("reads filters and sort from the query string", async () => {
  typingLabEntries.push(
    buildEntry({ slug: "artist-entry", name: "Artist Entry", domain: "Artist", debated: true }),
    buildEntry({ slug: "scientist-entry", name: "Scientist Entry", domain: "Scientist", debated: false })
  );

  const router = renderWithRouter(["/typing-lab?domain=Artist&debated=1&sort=Most%20sourced"]);

  await screen.findByText(/Artist Entry/i);
  const scientist = screen.queryByText(/Scientist Entry/i);
  if (scientist) {
    throw new Error("Scientist Entry should not be visible when filtering by debated artists");
  }

  expect(router.state.location.search).toBe("?domain=Artist&debated=1&sort=Most+sourced");
});

test("updates query string when sort selection changes", async () => {
  typingLabEntries.push(buildEntry({ slug: "sort-entry", name: "Sort Entry" }));
  const router = renderWithRouter();

  const sortTrigger = await screen.findByRole("combobox", { name: /sort/i });
  fireEvent.click(sortTrigger);

  const highestConfidence = await screen.findByRole("option", { name: /Highest confidence/i });
  fireEvent.click(highestConfidence);

  await waitFor(() => {
    expect(router.state.location.search).toBe("?sort=Highest+confidence");
  });
});
