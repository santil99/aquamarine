import type { BusinessContext } from "@/domain/business/businessContext";

// Temporary until the business context is loaded from persistence.
export const activeBusiness: BusinessContext = {
  businessId: "mock-business",
  timeZone: "America/Argentina/Buenos_Aires",
};
