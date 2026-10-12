const CENTS_PER_UNIT = 100n;

/**
 * Sums decimal amount strings (up to 2 decimals) exactly, using integer cents.
 */
export function sumSaleAmounts(amounts: string[]): string {
  const totalCents = amounts.reduce((sum, amount) => sum + toCents(amount), 0n);
  const units = totalCents / CENTS_PER_UNIT;
  const cents = (totalCents % CENTS_PER_UNIT).toString().padStart(2, "0");

  return `${units}.${cents}`;
}

function toCents(amount: string): bigint {
  const [units, fraction = ""] = amount.split(".");
  return BigInt(units) * CENTS_PER_UNIT + BigInt(fraction.padEnd(2, "0"));
}
