import assert from "node:assert/strict";
import test from "node:test";
import { parseWeightExpression } from "../lib/weight-expression.ts";

test("accepts individual weights and sums, including spaces and decimals", () => {
  for (const [input, expected] of [
    ["135+50", 185],
    [" 135 + 50 + 2.5 ", 187.5],
    ["20+20+20", 60],
    ["72,5 + 2,5", 75],
    [".5 + ,5", 1],
    ["185", 185],
    ["0", 0],
  ]) {
    assert.equal(parseWeightExpression(input), expected, input);
  }
});

test("rejects empty, incomplete, negative and unsupported expressions", () => {
  for (const input of [
    "", " ", "135+", "+50", "135++50", "135 50", "-5", "135+-50",
    "135-50", "20*2", "(135+50)", "1e3", "Infinity", "NaN", "1,2.3",
    "alert(1)", "0x10", "9".repeat(400),
  ]) {
    assert.ok(Number.isNaN(parseWeightExpression(input)), input);
  }
});

test("a sum behaves exactly like its total in estimates and unit conversion", () => {
  const estimate = (bodyweight, load, reps, rir = 0) => {
    const weight = parseWeightExpression(bodyweight) + parseWeightExpression(load);
    const effectiveReps = reps + rir;
    return (weight * (1 + effectiveReps / 30) +
      weight * 36 / (37 - effectiveReps) + weight * effectiveReps ** 0.1) / 3;
  };
  assert.equal(estimate("70+5", "15+5", 5, 2), estimate("75", "20", 5, 2));
  const pounds = parseWeightExpression("135+50") * 2.2046226218;
  assert.ok(Math.abs(pounds - 407.855185033) < 1e-8);
  assert.ok(Math.abs(pounds / 2.2046226218 - 185) < 1e-10);
});
