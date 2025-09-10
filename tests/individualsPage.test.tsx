import test, { mock } from "node:test";
import { JSDOM } from "jsdom";
import { render, screen, fireEvent } from "@testing-library/react";
import assert from "node:assert/strict";
import Individuals, { individualServices } from "../src/pages/Individuals";
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

// Mock Cal.com API to avoid network calls
mock.method(calReact, "getCalApi", async () => {
  return () => undefined;
});

test("Individuals services render and book scrolls", () => {
  render(<Individuals />);

  const cards = screen.getAllByTestId("individual-service");
  assert.equal(cards.length, individualServices.length);

  const learnLinks = screen.getAllByRole("link", { name: "Learn more" });
  individualServices.forEach((service, idx) => {
    assert.equal(learnLinks[idx].getAttribute("href"), service.routePath);
  });

  let scrolled = false;
  (document.getElementById("booking") as HTMLElement).scrollIntoView = () => {
    scrolled = true;
  };

  const bookButtons = screen.getAllByRole("button", { name: "Book now" });
  fireEvent.click(bookButtons[0]);
  assert.ok(scrolled);

  // Cal section exists
  assert.ok(screen.getByTestId("individuals-cal"));
});

