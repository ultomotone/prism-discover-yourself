// IMPORTANT: setup imports FIRST
import "./setup/dom";
import "./setup/cal-mocks";

import test, { beforeEach, afterEach } from "node:test";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import assert from "node:assert/strict";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Individuals from "../src/pages/Individuals";

beforeEach(() => {
  (globalThis as any).HTMLElement.prototype.scrollIntoView = function () {};
});

afterEach(() => {
  cleanup();
  (globalThis as any).HTMLElement.prototype.scrollIntoView = function () {};
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

test("Book now scrolls to #book and shows cal widget", async () => {
  render(
    <MemoryRouter>
      <Individuals />
    </MemoryRouter>
  );
  const bookButtons = await screen.findAllByRole("button", { name: /book now/i });
  assert.ok(bookButtons.length > 0, "should render at least one Book now button");

  const spy = test.mock.method(HTMLElement.prototype as any, "scrollIntoView");
  fireEvent.click(bookButtons[0]);

  const calSection = await screen.findByTestId("individuals-cal");
  assert.ok(calSection, "Cal section should be present");

  const widget = await screen.findByTestId("cal-widget");
  assert.ok(widget, "Cal widget should render");

  assert.equal(spy.mock.callCount(), 1, "should scroll once");
  spy.mock.restore();
});
