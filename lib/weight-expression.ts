/** Accept only non-negative decimal numbers joined by +. Never execute input. */
export function parseWeightExpression(input: string): number {
  const terms = input.split("+").map((term) => term.trim());

  if (!terms.every((term) => /^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(term))) {
    return Number.NaN;
  }

  const total = terms.reduce(
    (sum, term) => sum + Number(term.replace(",", ".")),
    0,
  );

  return Number.isFinite(total) ? total : Number.NaN;
}
