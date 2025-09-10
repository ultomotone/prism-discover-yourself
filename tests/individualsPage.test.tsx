// IMPORTANT: setup imports FIRST
import "./setup/dom";

import test, { afterEach } from "node:test";
import { render, screen, cleanup } from "@testing-library/react";
import assert from "node:assert/strict";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Individuals from "../src/pages/Individuals";

afterEach(() => {
  cleanup();
});

test("renders all individual services and Learn more links", async () => {
  render(
    <MemoryRouter>
      <Individuals />
    </MemoryRouter>
  );
  const cards = await screen.findAllByTestId("individual-service");
  assert.ok(cards.length > 0, "should render at least one service card");

  const links = screen.getAllByRole("link", { name: /learn more/i });
  assert.ok(links.length === cards.length, "each card should have a Learn more link");
  links.forEach((a) => {
    const href = (a as HTMLAnchorElement).getAttribute("href");
    assert.ok(href && href.startsWith("/solutions/"), "link href should target a solutions route");
  });
});
