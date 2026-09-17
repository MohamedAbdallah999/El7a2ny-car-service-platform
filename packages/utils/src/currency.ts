import { DEFAULT_CURRENCY } from "@car-platform/constants";

// Amounts are stored as Prisma Decimal and typically arrive over the wire as
// strings; accept both rather than forcing every caller to convert first.
export const formatCurrency = (
  amount: number | string,
  currency: string = DEFAULT_CURRENCY,
  locale = "en-EG",
): string => {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
};
