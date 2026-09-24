import { z } from "@car-platform/validation";

export const uploadFileSchema = z
  .object({
    fileName: z.string().trim().min(1).max(255),
    mimeType: z.enum(["image/png", "image/jpeg", "application/pdf"]),
    data: z.string().min(1).max(7_000_000),
    purpose: z
      .enum(["VERIFICATION_DOCUMENT", "BUSINESS_IMAGE", "PRODUCT_IMAGE"])
      .optional(),
  })
  .strict();

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
