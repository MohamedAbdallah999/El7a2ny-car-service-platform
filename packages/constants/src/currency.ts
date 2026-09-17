// Matches the Prisma schema's per-row `currency` column default (see
// backend/prisma/schema.prisma: Service, Booking, Product, Order, Payment).
export const DEFAULT_CURRENCY = "EGP";

export const SUPPORTED_CURRENCIES = ["EGP", "USD"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
