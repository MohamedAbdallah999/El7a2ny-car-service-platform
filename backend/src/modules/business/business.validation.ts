import { BUSINESS_TYPE_VALUES } from "@car-platform/constants";
import {
  emailSchema,
  paginationQuerySchema,
  phoneSchema,
  uuidSchema,
  z,
} from "@car-platform/validation";

const businessTypeSchema = z.enum(BUSINESS_TYPE_VALUES);

const timeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format");

const businessHourSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    openingTime: timeOfDaySchema.optional(),
    closingTime: timeOfDaySchema.optional(),
    isClosed: z.boolean().default(false),
  })
  .strict()
  .superRefine((hours, context) => {
    if (hours.isClosed) return;
    if (!hours.openingTime) {
      context.addIssue({
        code: "custom",
        path: ["openingTime"],
        message: "Opening time is required for an open day",
      });
    }
    if (!hours.closingTime) {
      context.addIssue({
        code: "custom",
        path: ["closingTime"],
        message: "Closing time is required for an open day",
      });
    }
    if (
      hours.openingTime &&
      hours.closingTime &&
      hours.openingTime >= hours.closingTime
    ) {
      context.addIssue({
        code: "custom",
        path: ["closingTime"],
        message: "Closing time must be after opening time",
      });
    }
  });

export const createBusinessSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
    businessType: businessTypeSchema,
    registrationNumber: z.string().trim().max(100).optional(),
    taxNumber: z.string().trim().max(100).optional(),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    onboardingServices: z
      .array(z.string().trim().min(1).max(100))
      .max(30)
      .optional(),
    website: z.string().trim().url().max(2048).optional(),
    logoUrl: z.string().trim().url().max(2048).optional(),
    coverImageUrl: z.string().trim().url().max(2048).optional(),
  })
  .strict();

export const updateBusinessSchema = createBusinessSchema
  .partial()
  .extend({
    description: z.string().trim().max(5000).nullable().optional(),
    email: emailSchema.nullable().optional(),
    phone: phoneSchema.nullable().optional(),
    website: z.string().trim().url().max(2048).nullable().optional(),
    logoUrl: z.string().trim().url().max(2048).nullable().optional(),
    coverImageUrl: z.string().trim().url().max(2048).nullable().optional(),
  })
  .strict();

export const businessListQuerySchema = paginationQuerySchema
  .extend({
    businessType: businessTypeSchema.optional(),
    city: z.string().trim().min(1).max(100).optional(),
    search: z.string().trim().min(1).max(200).optional(),
  })
  .strict();

export const businessVerificationSchema = z
  .object({
    status: z.enum(["UNDER_REVIEW", "VERIFIED", "REJECTED"]),
    reason: z.string().trim().max(1000).optional(),
  })
  .strict();

export const businessStatusSchema = z
  .object({
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "CLOSED"]),
  })
  .strict();

export const createBranchSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
    phone: phoneSchema.optional(),
    email: emailSchema.optional(),
    addressLine1: z.string().trim().min(1),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().max(100).optional(),
    country: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().max(20).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    isPrimary: z.boolean().optional(),
  })
  .strict();

export const updateBranchSchema = createBranchSchema
  .partial()
  .extend({
    status: z.enum(["ACTIVE", "INACTIVE", "CLOSED"]).optional(),
  })
  .strict();

export const businessHoursSchema = z
  .object({
    hours: z
      .array(businessHourSchema)
      .min(1)
      .max(7)
      .superRefine((hours, context) => {
        const days = new Set<number>();
        hours.forEach((entry, index) => {
          if (days.has(entry.dayOfWeek)) {
            context.addIssue({
              code: "custom",
              path: [index, "dayOfWeek"],
              message: "Each day can only be configured once",
            });
          }
          days.add(entry.dayOfWeek);
        });
      }),
  })
  .strict();

export const createHolidaySchema = z
  .object({
    date: z.coerce.date(),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const createDocumentSchema = z
  .object({
    documentType: z.enum([
      "BUSINESS_LICENSE",
      "TAX_DOCUMENT",
      "OWNER_ID",
      "COMMERCIAL_REGISTRATION",
      "OTHER",
    ]),
    documentNumber: z.string().trim().max(150).optional(),
    fileUrl: z.string().trim().url().max(2048),
  })
  .strict();

export const reviewDocumentSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    rejectionReason: z.string().trim().max(1000).optional(),
  })
  .strict();

export const idParamSchema = z.object({ id: uuidSchema }).strict();

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type BusinessListQueryInput = z.infer<typeof businessListQuerySchema>;
export type BusinessVerificationInput = z.infer<
  typeof businessVerificationSchema
>;
export type BusinessStatusInput = z.infer<typeof businessStatusSchema>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>;
export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type ReviewDocumentInput = z.infer<typeof reviewDocumentSchema>;
