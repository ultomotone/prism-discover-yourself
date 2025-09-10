// IMPORTANT: setup imports FIRST
import "./setup/dom";
import "./setup/cal-mocks";

import test, { beforeEach, afterEach } from "node:test";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import assert from "node:assert/strict";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Organizations from "../src/pages/Organizations";

beforeEach(() => {
  (globalThis as any).HTMLElement.prototype.scrollIntoView = function () {};
});

afterEach(() => {
  cleanup();
  (globalThis as any).HTMLElement.prototype.scrollIntoView = function () {};
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

test("Book now scrolls to #book and shows cal widget", async () => {
  render(
    <MemoryRouter>
      <Organizations />
    </MemoryRouter>
  );
  const bookButtons = await screen.findAllByRole("button", { name: /book now/i });

  const spy = test.mock.method(HTMLElement.prototype as any, "scrollIntoView");
  fireEvent.click(bookButtons[0]);

  const calSection = await screen.findByTestId("organizations-cal");
  assert.ok(calSection);

  const widget = await screen.findByTestId("cal-widget");
  assert.ok(widget);

  assert.equal(spy.mock.callCount(), 1);
  spy.mock.restore();
});
