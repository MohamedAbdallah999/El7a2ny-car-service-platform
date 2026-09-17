// Human-readable, sortable reference numbers for the schema's unique
// `*Number`/`*Reference` columns: Booking.bookingNumber,
// ServiceRequest.requestNumber, Order.orderNumber, SupportTicket.ticketNumber,
// BusinessPayout.payoutReference, Payment.paymentReference. Format:
// "<PREFIX>-<YYYYMMDD>-<6 random uppercase base36 chars>". The date segment
// makes references easy to scan/sort visually; the random suffix is not a
// uniqueness guarantee on its own — callers still rely on the column's
// unique constraint and should retry on a rare collision.
export const generateReferenceNumber = (prefix: string): string => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()
    .padEnd(6, "0");

  return `${prefix}-${datePart}-${randomPart}`;
};
