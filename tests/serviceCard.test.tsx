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
  delete (window as unknown as { fbTrack?: unknown }).fbTrack;
  delete (window as unknown as { __lastFbDpaPayload?: unknown }).__lastFbDpaPayload;
});

test("renders Book button, triggers onSelect, and fires AddToCart", () => {
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

  const calls: Array<{ event: string; payload: Record<string, unknown> }> = [];
  (window as unknown as {
    fbTrack?: (eventName: string, payload?: Record<string, unknown>) => string;
  }).fbTrack = (eventName, payload = {}) => {
    calls.push({ event: eventName, payload });
    return "evt";
  };

  render(<ServiceCard service={svc} onSelect={onSelect} />);

  const button = screen.getByRole("button", { name: /book/i });
  fireEvent.click(button);
  assert.equal(selected, svc);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].event, "AddToCart");
  const payload = calls[0].payload;
  assert.equal(payload.content_type, "product");
  assert.deepEqual(payload.content_ids, [svc.id]);
  assert(Array.isArray(payload.contents));
  assert.equal(payload.contents?.[0]?.content_id, svc.id);
  assert.equal(payload.contents?.[0]?.content_name, svc.title);
  assert.equal(payload.contents?.[0]?.content_price, 149);
  assert.equal(payload.value, 149);
  assert.equal(payload.currency, "USD");

  const remembered = (window as unknown as { __lastFbDpaPayload?: Record<string, unknown> })
    .__lastFbDpaPayload;
  assert(remembered, "expected payload to be remembered for purchase");
  assert.deepEqual(remembered?.content_ids, [svc.id]);
});
