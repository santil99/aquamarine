/** Formats a sale timestamp as DD/MM/AAAA in the business time zone. */
export function formatShortDate(createdAt: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  }).format(new Date(createdAt));
}
