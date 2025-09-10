// IMPORTANT: setup imports FIRST
import "./setup/dom";

import test, { afterEach } from "node:test";
import { render, screen, cleanup } from "@testing-library/react";
import assert from "node:assert/strict";
import React from "react";
import { ServiceCard } from "../src/components/ServiceCard";
import type { Service } from "../src/data/services";

afterEach(() => {
  cleanup();
});

test("renders Learn more link and no Book button", () => {
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

  render(<ServiceCard service={svc} />);

  const link = screen.getByRole("link", { name: /learn more/i });
  assert.equal(
    (link as HTMLAnchorElement).getAttribute("href"),
    "/solutions/individuals/personality-mapping-call"
  );
  const book = screen.queryByText(/book/i);
  assert.equal(book, null);
});
