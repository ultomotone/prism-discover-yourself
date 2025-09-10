import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Organizations from "../src/pages/Organizations";

describe("Organizations page", () => {
  it("renders services and booking embed", () => {
    const html = renderToString(
      <StaticRouter location="/organizations">
        <Organizations />
      </StaticRouter>
    );
    const services = html.match(/data-testid="organization-service"/g) ?? [];
    assert.equal(services.length, 7);
    const slugs = [
      "owner-leader-discovery-20m-49-credit",
      "team-compass-workshop-group-up-to-8",
      "leadership-debrief",
      "sales-persona-play",
      "manager-coaching-by-persona",
      "hiring-fit-screen",
      "team-performance-sprint-4-950-mo-8-12-people-2-months",
    ];
    for (const slug of slugs) {
      assert.ok(html.includes(`/solutions/organizations/${slug}`));
    }
    assert.ok(html.includes("organizations-cal"));
  });
});
