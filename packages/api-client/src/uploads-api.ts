import type { ApiClient } from "./client.js";

export interface UploadFilePayload {
  fileName: string;
  mimeType: "image/png" | "image/jpeg" | "application/pdf";
  data: string;
  purpose?: "VERIFICATION_DOCUMENT" | "BUSINESS_IMAGE" | "PRODUCT_IMAGE";
}

export const createUploadsApi = (client: ApiClient) => ({
  upload: (payload: UploadFilePayload) =>
    client.request<{ fileName: string; fileUrl: string }>("/uploads", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
});

export type UploadsApi = ReturnType<typeof createUploadsApi>;
