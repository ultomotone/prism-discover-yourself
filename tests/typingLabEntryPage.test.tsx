import "./setup/dom";

import test, { afterEach } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import TypingLabEntry from "../src/pages/TypingLabEntry";
import { MemoryRouter, Route, Routes } from "react-router-dom";

afterEach(() => {
  cleanup();
});

test("shows fallback when dossier data is unavailable", async () => {
  render(
    <MemoryRouter initialEntries={["/typing-lab/serena-williams-2024-athlete"]}>
      <Routes>
        <Route path="/typing-lab/:slug" element={<TypingLabEntry />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByText(/Typing not found/i);
  await screen.findByRole("link", { name: /Back to Typing Lab/i });
  const submitLink = await screen.findByRole("link", { name: /Submit a source/i });
  const href = submitLink.getAttribute("href");
  if (href !== "mailto:team@prismpersonality.com") {
    throw new Error(`Expected submit link mailto to be team@prismpersonality.com but received ${href ?? "unknown"}`);
  }
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
