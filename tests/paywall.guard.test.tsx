import "./setup/dom";

import React from "react";
import test, { afterEach } from "node:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import assert from "node:assert/strict";

import { PaywallGuard } from "../src/components/PaywallGuard";

afterEach(() => {
  cleanup();
});

test("flag off renders full results immediately", () => {
  render(
    <PaywallGuard profile={{ paid: false }} sessionId="session-1" paywallEnabled={false}>
      <div>Full Results Content</div>
    </PaywallGuard>
  );

  assert.ok(screen.getByText("Full Results Content"));
  assert.equal(screen.queryByText("Unlock full results"), null);
});

test("flag on + unpaid shows paywall teaser", () => {
  let unlockedSession: string | null = null;

  render(
    <PaywallGuard
      profile={{
        paid: false,
        type_code: "INTJ",
        dims_highlights: { coherent: ["Strategic Clarity"], unique: ["Visionary Drive"] },
      }}
      sessionId="session-2"
      paywallEnabled
      onUnlock={(session) => {
        unlockedSession = session;
      }}
      billingHook={<div data-testid="billing-hook">Billing Flow Slot</div>}
    >
      <div>Hidden Content</div>
    </PaywallGuard>
  );

  assert.ok(screen.getByText(/unlock your full prism results/i));
  assert.ok(screen.getByText(/INTJ/));
  assert.equal(screen.queryByText("Hidden Content"), null);

  const highlightList = screen.getByTestId("paywall-highlights");
  const highlightItems = highlightList.querySelectorAll("li");
  assert.equal(highlightItems.length, 2);

  const button = screen.getByRole("button", { name: /unlock full results/i });
  fireEvent.click(button);
  assert.equal(unlockedSession, "session-2");

  assert.ok(screen.getByTestId("billing-hook"));
});

test("flag on + paid renders full results", () => {
  render(
    <PaywallGuard profile={{ paid: true }} sessionId="session-3" paywallEnabled>
      <div>Unlocked Results</div>
    </PaywallGuard>
  );

  assert.ok(screen.getByText("Unlocked Results"));
});
