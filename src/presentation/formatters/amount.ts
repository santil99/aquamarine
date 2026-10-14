/**
 * Formats a decimal amount string without going through a JS number, so large
 * values keep their exact digits. Fraction digits are shown only when non-zero.
 */
export function formatAmount(amount: string, locale: string): string {
  const [units, fraction = ""] = amount.split(".");
  const formatter = new Intl.NumberFormat(locale);
  const groupedUnits = formatter.format(BigInt(units));

  if (!/[1-9]/.test(fraction)) {
    return groupedUnits;
  }

  const decimalSeparator =
    formatter.formatToParts(1.1).find((part) => part.type === "decimal")?.value ?? ".";

  return `${groupedUnits}${decimalSeparator}${fraction.padEnd(2, "0")}`;
}

/** Prefixes the amount with the peso sign; the amount itself follows `formatAmount`. */
export function formatArsAmount(amount: string, locale: string): string {
  const isNegative = amount.startsWith("-");
  const sign = isNegative ? "-" : "";

  return `${sign}$ ${formatAmount(isNegative ? amount.slice(1) : amount, locale)}`;
}
