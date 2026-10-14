const CENTS_PER_UNIT = 100n;

/**
 * Sums decimal amount strings (up to 2 decimals) exactly, using integer cents.
 */
export function sumSaleAmounts(amounts: string[]): string {
  return formatCents(amounts.reduce((sum, amount) => sum + toCents(amount), 0n));
}

export function subtractSaleAmounts(minuend: string, subtrahend: string): string {
  return formatCents(toCents(minuend) - toCents(subtrahend));
}

export function compareSaleAmounts(left: string, right: string): number {
  const difference = toCents(left) - toCents(right);

  if (difference > 0n) return 1;
  return difference < 0n ? -1 : 0;
}

function formatCents(totalCents: bigint): string {
  const sign = totalCents < 0n ? "-" : "";
  const absoluteCents = totalCents < 0n ? -totalCents : totalCents;
  const units = absoluteCents / CENTS_PER_UNIT;
  const cents = (absoluteCents % CENTS_PER_UNIT).toString().padStart(2, "0");

  return `${sign}${units}.${cents}`;
}

function toCents(amount: string): bigint {
  const [units, fraction = ""] = amount.split(".");
  return BigInt(units) * CENTS_PER_UNIT + BigInt(fraction.padEnd(2, "0"));
}
