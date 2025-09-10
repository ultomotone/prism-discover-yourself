import test, { mock } from "node:test";
import { JSDOM } from "jsdom";
import { render, screen, fireEvent } from "@testing-library/react";
import assert from "node:assert/strict";
import Organizations, { organizationServices } from "../src/pages/Organizations";
import * as calReact from "@calcom/embed-react";

// Create JSDOM environment and assign globals
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
});

Object.assign(globalThis, {
  window: dom.window as unknown as Window & typeof globalThis,
  document: dom.window.document,
  navigator: dom.window.navigator,
});

mock.method(calReact, "getCalApi", async () => {
  return () => undefined;
});

test("Organization services render and book scrolls", () => {
  render(<Organizations />);

  const cards = screen.getAllByTestId("organization-service");
  assert.equal(cards.length, organizationServices.length);

  const learnLinks = screen.getAllByRole("link", { name: "Learn more" });
  organizationServices.forEach((service, idx) => {
    assert.equal(learnLinks[idx].getAttribute("href"), service.routePath);
  });

  let scrolled = false;
  (globalThis as any).HTMLElement.prototype.scrollIntoView = () => {
    scrolled = true;
  };

  const bookButtons = screen.getAllByRole("button", { name: "Book now" });
  fireEvent.click(bookButtons[0]);
  assert.ok(scrolled);

  assert.ok(screen.getByTestId("organizations-cal"));
});

