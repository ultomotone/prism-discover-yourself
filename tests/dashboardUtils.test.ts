import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aggregateCompletions, DailyCompletion } from "../src/utils/dashboard";

const sample: DailyCompletion[] = [
  { date: "2025-01-01", value: 1 },
  { date: "2025-01-02", value: 2 },
  { date: "2025-01-08", value: 3 },
  { date: "2025-02-01", value: 4 },
];

describe("aggregateCompletions", () => {
  it("keeps daily data when mode is day", () => {
    assert.deepStrictEqual(aggregateCompletions(sample, "day"), [
      { x: "2025-01-01", y: 1 },
      { x: "2025-01-02", y: 2 },
      { x: "2025-01-08", y: 3 },
      { x: "2025-02-01", y: 4 },
    ]);
  });

  it("aggregates by ISO week starting Monday", () => {
    assert.deepStrictEqual(aggregateCompletions(sample, "week"), [
      { x: "2024-12-30", y: 3 },
      { x: "2025-01-06", y: 3 },
      { x: "2025-01-27", y: 4 },
    ]);
  });

  it("aggregates by month", () => {
    assert.deepStrictEqual(aggregateCompletions(sample, "month"), [
      { x: "2025-01-01", y: 6 },
      { x: "2025-02-01", y: 4 },
    ]);
  });
});
