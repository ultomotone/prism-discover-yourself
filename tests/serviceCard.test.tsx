// IMPORTANT: setup imports FIRST
import "./setup/dom";

import test, { afterEach } from "node:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import assert from "node:assert/strict";
import React from "react";
import { ServiceCard } from "../src/components/ServiceCard";
import type { Service } from "../src/data/services";

afterEach(() => {
  cleanup();
});

test("renders Book button and triggers onSelect", () => {
  const svc: Service = {
    id: "daniel-speiss/personality-mapping-call",
    scope: "individuals",
    tagline: "",
    title: "Personality Mapping",
    duration: "45m",
    price: "$149.00",
    description: "",
    deliverables: ["d1", "d2", "d3"],
    roi: "ROI info",
  };

  let selected: Service | null = null;
  const onSelect = (s: Service) => {
    selected = s;
  };

  render(<ServiceCard service={svc} onSelect={onSelect} />);

  const button = screen.getByRole("button", { name: /book/i });
  fireEvent.click(button);
  assert.equal(selected, svc);
});
