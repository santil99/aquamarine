const AMOUNT_LOCALE = "es-AR";

/**
 * Formats a decimal amount string without going through a JS number, so large
 * values keep their exact digits. Fraction digits are shown only when non-zero.
 */
export function formatAmount(amount: string): string {
  const [units, fraction = ""] = amount.split(".");
  const formatter = new Intl.NumberFormat(AMOUNT_LOCALE);
  const groupedUnits = formatter.format(BigInt(units));

  if (!/[1-9]/.test(fraction)) {
    return groupedUnits;
  }

  const decimalSeparator =
    formatter.formatToParts(1.1).find((part) => part.type === "decimal")?.value ?? ".";

  return `${groupedUnits}${decimalSeparator}${fraction.padEnd(2, "0")}`;
}
