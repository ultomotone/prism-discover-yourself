import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Individuals from "../src/pages/Individuals";

describe("Individuals page", () => {
  it("renders services and booking embed", () => {
    const html = renderToString(
      <StaticRouter location="/individuals">
        <Individuals />
      </StaticRouter>
    );
    const services = html.match(/data-testid="individual-service"/g) ?? [];
    assert.equal(services.length, 5);
    const slugs = [
      "personal-discovery-20m-29-credit",
      "personality-mapping-call",
      "compatibility-debrief-couples",
      "career-clarity-mapping",
      "progress-retake-tune-up",
    ];
    for (const slug of slugs) {
      assert.ok(html.includes(`/solutions/individuals/${slug}`));
    }
    assert.ok(html.includes("individuals-cal"));
  });
});
