import React from "react";
import { renderToString } from "react-dom/server";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import RealTimeType from "../src/pages/RealTimeType";

describe("RealTimeType", () => {
  it("renders empty state when no history", () => {
    const html = renderToString(<RealTimeType />);
    assert.ok(html.includes("No recent assessments available"));
  });
});
