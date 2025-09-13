// IMPORTANT: setup imports FIRST
import "./setup/dom";

import test, { afterEach } from "node:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import assert from "node:assert/strict";
import React from "react";
import IndividualsPage from "../src/app/individuals/page";
import { SERVICES } from "../src/data/services";

afterEach(() => {
  cleanup();
});

test("renders service cards and updates selection", async () => {
  process.env.NEXT_PUBLIC_SCHED_PROVIDER = "tidycal";
  const options = SERVICES.filter((s) => s.scope === "individuals");
  render(<IndividualsPage />);
  const buttons = await screen.findAllByRole("button", { name: /book/i });
  // includes duplicate "recommended" card
  const expected = options.length + 1;
  assert.equal(
    buttons.length,
    expected,
    "should render a Book button for each service (plus recommended)"
  );

  const initial = options[1] || options[0];
  await screen.findByRole("heading", { level: 2, name: initial.title });

  fireEvent.click(buttons[0]);
  await screen.findByRole("heading", { level: 2, name: options[0].title });
});
