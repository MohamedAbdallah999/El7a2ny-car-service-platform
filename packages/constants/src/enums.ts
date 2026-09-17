// Auto-derived from backend/prisma/schema.prisma enums.
// Mirrors the Prisma enums as plain string-literal unions so
// frontend and shared packages can use them without depending
// on the generated Prisma client (which is backend-only).
// Regenerate by hand whenever an enum in schema.prisma changes.

export const USER_ROLE_VALUES = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"] as const;
export type UserRole = (typeof USER_ROLE_VALUES)[number];

export const USER_STATUS_VALUES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "DELETED",
] as const;
export type UserStatus = (typeof USER_STATUS_VALUES)[number];

export const SESSION_PLATFORM_VALUES = [
  "WEB",
  "IOS",
  "ANDROID",
  "OTHER",
] as const;
export type SessionPlatform = (typeof SESSION_PLATFORM_VALUES)[number];

export const VERIFICATION_TOKEN_TYPE_VALUES = [
  "EMAIL_VERIFICATION",
  "PHONE_VERIFICATION",
  "PASSWORD_RESET",
] as const;
export type VerificationTokenType =
  (typeof VERIFICATION_TOKEN_TYPE_VALUES)[number];

export const AUTH_CHALLENGE_TYPE_VALUES = ["PRIVILEGED_LOGIN"] as const;
export type AuthChallengeType = (typeof AUTH_CHALLENGE_TYPE_VALUES)[number];

export const GENDER_VALUES = [
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
] as const;
export type Gender = (typeof GENDER_VALUES)[number];

export const BUSINESS_TYPE_VALUES = [
  "GARAGE",
  "WORKSHOP",
  "SERVICE_CENTER",
  "CAR_DEALERSHIP",
  "TIRE_SHOP",
  "CAR_WASH",
  "DETAILING",
  "AUTO_ELECTRICAL",
  "BODY_REPAIR",
  "SPARE_PARTS",
  "MULTI_SERVICE",
  "OTHER",
] as const;
export type BusinessType = (typeof BUSINESS_TYPE_VALUES)[number];

export const BUSINESS_STATUS_VALUES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "CLOSED",
] as const;
export type BusinessStatus = (typeof BUSINESS_STATUS_VALUES)[number];

export const VERIFICATION_STATUS_VALUES = [
  "PENDING",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUS_VALUES)[number];

export const BRANCH_STATUS_VALUES = ["ACTIVE", "INACTIVE", "CLOSED"] as const;
export type BranchStatus = (typeof BRANCH_STATUS_VALUES)[number];

export const BUSINESS_DOCUMENT_TYPE_VALUES = [
  "BUSINESS_LICENSE",
  "TAX_DOCUMENT",
  "OWNER_ID",
  "COMMERCIAL_REGISTRATION",
  "OTHER",
] as const;
export type BusinessDocumentType =
  (typeof BUSINESS_DOCUMENT_TYPE_VALUES)[number];

export const DOCUMENT_VERIFICATION_STATUS_VALUES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;
export type DocumentVerificationStatus =
  (typeof DOCUMENT_VERIFICATION_STATUS_VALUES)[number];

export const FUEL_TYPE_VALUES = [
  "PETROL",
  "DIESEL",
  "HYBRID",
  "ELECTRIC",
  "LPG",
  "OTHER",
] as const;
export type FuelType = (typeof FUEL_TYPE_VALUES)[number];

export const TRANSMISSION_TYPE_VALUES = [
  "MANUAL",
  "AUTOMATIC",
  "CVT",
  "DCT",
  "OTHER",
] as const;
export type TransmissionType = (typeof TRANSMISSION_TYPE_VALUES)[number];

export const SERVICE_REQUEST_STATUS_VALUES = [
  "PENDING",
  "REVIEWING",
  "QUOTED",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
] as const;
export type ServiceRequestStatus =
  (typeof SERVICE_REQUEST_STATUS_VALUES)[number];

export const SERVICE_REQUEST_PRIORITY_VALUES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;
export type ServiceRequestPriority =
  (typeof SERVICE_REQUEST_PRIORITY_VALUES)[number];

export const BOOKING_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "REJECTED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUS_VALUES)[number];

export const PRODUCT_STATUS_VALUES = [
  "ACTIVE",
  "INACTIVE",
  "OUT_OF_STOCK",
  "DISCONTINUED",
  "SUSPENDED",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUS_VALUES)[number];

export const INVENTORY_MOVEMENT_TYPE_VALUES = [
  "PURCHASE",
  "SALE",
  "RETURN",
  "ADJUSTMENT",
  "DAMAGE",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "RESERVATION",
  "RELEASE",
] as const;
export type InventoryMovementType =
  (typeof INVENTORY_MOVEMENT_TYPE_VALUES)[number];

export const CART_STATUS_VALUES = ["ACTIVE", "ABANDONED", "CONVERTED"] as const;
export type CartStatus = (typeof CART_STATUS_VALUES)[number];

export const ORDER_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export const SHIPMENT_STATUS_VALUES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "RETURNED",
  "CANCELLED",
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUS_VALUES)[number];

export const PAYMENT_METHOD_VALUES = [
  "CARD",
  "CASH",
  "WALLET",
  "BANK_TRANSFER",
  "ONLINE_PAYMENT",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];

export const PAYMENT_STATUS_VALUES = [
  "PENDING",
  "PROCESSING",
  "SUCCEEDED",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "CANCELLED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];

export const REFUND_STATUS_VALUES = [
  "PENDING",
  "PROCESSING",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
] as const;
export type RefundStatus = (typeof REFUND_STATUS_VALUES)[number];

export const REVIEW_STATUS_VALUES = [
  "PENDING",
  "PUBLISHED",
  "HIDDEN",
  "REJECTED",
] as const;
export type ReviewStatus = (typeof REVIEW_STATUS_VALUES)[number];

export const DISCOUNT_TYPE_VALUES = ["PERCENTAGE", "FIXED_AMOUNT"] as const;
export type DiscountType = (typeof DISCOUNT_TYPE_VALUES)[number];

export const NOTIFICATION_TYPE_VALUES = [
  "BOOKING_CONFIRMED",
  "BOOKING_CANCELLED",
  "BOOKING_REMINDER",
  "ORDER_CONFIRMED",
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "SERVICE_REQUEST_UPDATED",
  "NEW_MESSAGE",
  "PROMOTION",
  "SYSTEM",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPE_VALUES)[number];

export const PUSH_PLATFORM_VALUES = ["IOS", "ANDROID", "WEB"] as const;
export type PushPlatform = (typeof PUSH_PLATFORM_VALUES)[number];

export const DISPUTE_REASON_VALUES = [
  "PAYMENT_ISSUE",
  "SERVICE_ISSUE",
  "PRODUCT_ISSUE",
  "ORDER_ISSUE",
  "BOOKING_ISSUE",
  "REFUND_ISSUE",
  "QUALITY_ISSUE",
  "OTHER",
] as const;
export type DisputeReason = (typeof DISPUTE_REASON_VALUES)[number];

export const DISPUTE_STATUS_VALUES = [
  "OPEN",
  "UNDER_REVIEW",
  "WAITING_FOR_CUSTOMER",
  "WAITING_FOR_BUSINESS",
  "RESOLVED",
  "REJECTED",
  "CLOSED",
] as const;
export type DisputeStatus = (typeof DISPUTE_STATUS_VALUES)[number];

export const SUPPORT_CATEGORY_VALUES = [
  "ACCOUNT",
  "PAYMENT",
  "BOOKING",
  "ORDER",
  "SERVICE",
  "PRODUCT",
  "BUSINESS",
  "TECHNICAL",
  "OTHER",
] as const;
export type SupportCategory = (typeof SUPPORT_CATEGORY_VALUES)[number];

export const SUPPORT_PRIORITY_VALUES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;
export type SupportPriority = (typeof SUPPORT_PRIORITY_VALUES)[number];

export const SUPPORT_TICKET_STATUS_VALUES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_USER",
  "RESOLVED",
  "CLOSED",
] as const;
export type SupportTicketStatus = (typeof SUPPORT_TICKET_STATUS_VALUES)[number];

export const BUSINESS_TRANSACTION_TYPE_VALUES = [
  "SALE",
  "SERVICE_PAYMENT",
  "REFUND",
  "COMMISSION",
  "PAYOUT",
  "ADJUSTMENT",
] as const;
export type BusinessTransactionType =
  (typeof BUSINESS_TRANSACTION_TYPE_VALUES)[number];

export const FINANCIAL_TRANSACTION_STATUS_VALUES = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;
export type FinancialTransactionStatus =
  (typeof FINANCIAL_TRANSACTION_STATUS_VALUES)[number];

export const PAYOUT_STATUS_VALUES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;
export type PayoutStatus = (typeof PAYOUT_STATUS_VALUES)[number];
