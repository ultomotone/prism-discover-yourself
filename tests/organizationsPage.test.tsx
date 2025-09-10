// IMPORTANT: setup imports FIRST
import "./setup/dom";

import test, { afterEach } from "node:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import assert from "node:assert/strict";
import React from "react";
import TeamsPage from "../src/app/teams/page";
import { SERVICES } from "../src/data/services";

afterEach(() => {
  cleanup();
});

test("renders team services and updates selection", async () => {
  process.env.NEXT_PUBLIC_SCHED_PROVIDER = "tidycal";
  const options = SERVICES.filter((s) => s.scope === "teams");
  render(<TeamsPage />);
  const buttons = await screen.findAllByRole("button", { name: /book/i });
  assert.equal(buttons.length, options.length);

  await screen.findByRole("heading", { level: 2, name: options[0].title });

  if (buttons.length > 1) {
    fireEvent.click(buttons[1]);
    await screen.findByRole("heading", { level: 2, name: options[1].title });
  }
});
