/**
 * Formats a sale timestamp in the business time zone so the date and time
 * match the day the sale was registered for.
 */
export function formatSaleDateTime(createdAt: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(createdAt));
}
