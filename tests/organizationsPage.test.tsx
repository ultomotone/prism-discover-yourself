// IMPORTANT: setup imports FIRST
import "./setup/dom";

import test, { afterEach } from "node:test";
import { render, screen, cleanup } from "@testing-library/react";
import assert from "node:assert/strict";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Organizations from "../src/pages/Organizations";

afterEach(() => {
  cleanup();
});

test("renders all organization services and Learn more links", async () => {
  render(
    <MemoryRouter>
      <Organizations />
    </MemoryRouter>
  );
  const cards = await screen.findAllByTestId("organization-service");
  assert.ok(cards.length > 0);

  const links = screen.getAllByRole("link", { name: /learn more/i });
  assert.ok(links.length === cards.length);
  links.forEach((a) => {
    const href = (a as HTMLAnchorElement).getAttribute("href");
    assert.ok(href && href.startsWith("/solutions/organizations/"));
  });
});
