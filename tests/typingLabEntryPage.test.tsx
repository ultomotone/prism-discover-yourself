import "./setup/dom";

import test, { afterEach } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import TypingLabEntry from "../src/pages/TypingLabEntry";
import { MemoryRouter, Route, Routes } from "react-router-dom";

afterEach(() => {
  cleanup();
});

test("renders a typing dossier with function map and evidence", async () => {
  render(
    <MemoryRouter initialEntries={["/typing-lab/serena-williams-2024-athlete"]}>
      <Routes>
        <Route path="/typing-lab/:slug" element={<TypingLabEntry />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByRole("heading", { name: /Serena Williams/i });
  await screen.findByText(/Function expression map/i);
  await screen.findByText(/Evidence ledger/i);
  await screen.findByText(/Differential diagnosis/i);
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
