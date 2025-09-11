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

test("renders path cards and updates selection", async () => {
  process.env.NEXT_PUBLIC_SCHED_PROVIDER = "tidycal";
  const all = SERVICES.filter((s) => s.scope === "individuals");
  const paths = all.slice(1);
  render(<IndividualsPage />);
  const buttons = await screen.findAllByRole("button", { name: /book/i });
  assert.equal(buttons.length, paths.length, "should render a Book button for each path");

  await screen.findByRole("heading", { level: 2, name: all[0].title });

  if (buttons.length > 0) {
    fireEvent.click(buttons[0]);
    await screen.findByRole("heading", { level: 2, name: paths[0].title });
  }
});
