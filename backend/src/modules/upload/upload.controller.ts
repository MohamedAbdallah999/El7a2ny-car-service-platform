import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";
import { UserRole } from "../../generated/prisma/client.js";
import type { UploadFileInput } from "./upload.validation.js";

const extensions: Record<UploadFileInput["mimeType"], string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "application/pdf": ".pdf",
};

const hasExpectedSignature = (
  buffer: Buffer,
  mimeType: UploadFileInput["mimeType"],
): boolean => {
  if (mimeType === "image/png") {
    return buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (mimeType === "image/jpeg") {
    return (
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[buffer.length - 2] === 0xff &&
      buffer[buffer.length - 1] === 0xd9
    );
  }
  return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
};

export const uploadFile = async (req: Request, res: Response) => {
  const input = req.body as UploadFileInput;
  const buffer = Buffer.from(input.data, "base64");
  if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
    throw new AppError(400, "File must be between 1 byte and 5 MB");
  }
  if (!hasExpectedSignature(buffer, input.mimeType)) {
    throw new AppError(400, "File content does not match its declared type");
  }

  const uploadDirectory = path.resolve(process.cwd(), "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  const storedName = `${randomUUID()}${extensions[input.mimeType]}`;
  await writeFile(path.join(uploadDirectory, storedName), buffer, {
    flag: "wx",
  });

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const publicImage =
    input.purpose === "BUSINESS_IMAGE" || input.purpose === "PRODUCT_IMAGE";
  res.status(201).json({
    fileName: input.fileName,
    fileUrl: `${baseUrl}/api/uploads/${publicImage ? "public/" : ""}${storedName}`,
  });
};

export const downloadPublicImage = async (req: Request, res: Response) => {
  const fileNameParam = req.params.fileName;
  const fileName = Array.isArray(fileNameParam)
    ? fileNameParam[0]
    : fileNameParam;
  if (!fileName || !/^[0-9a-f-]{36}\.(png|jpg)$/.test(fileName)) {
    throw new AppError(404, "File not found");
  }
  const suffix = `/api/uploads/public/${fileName}`;
  const [business, productImage] = await Promise.all([
    prisma.business.findFirst({
      where: {
        OR: [
          { logoUrl: { endsWith: suffix } },
          { coverImageUrl: { endsWith: suffix } },
        ],
      },
      select: { id: true },
    }),
    prisma.productImage.findFirst({
      where: { imageUrl: { endsWith: suffix } },
      select: { id: true },
    }),
  ]);
  if (!business && !productImage) throw new AppError(404, "File not found");
  res.sendFile(path.resolve(process.cwd(), "uploads", fileName));
};

export const downloadFile = async (req: Request, res: Response) => {
  const fileNameParam = req.params.fileName;
  const fileName = Array.isArray(fileNameParam)
    ? fileNameParam[0]
    : fileNameParam;
  if (
    !fileName ||
    !/^[0-9a-f-]{36}\.(png|jpg|pdf)$/.test(fileName) ||
    !req.user
  ) {
    throw new AppError(404, "File not found");
  }

  const document = await prisma.businessVerificationDocument.findFirst({
    where: { fileUrl: { endsWith: `/api/uploads/${fileName}` } },
    include: { business: { include: { admin: true } } },
  });
  const canAccess =
    document &&
    (req.user.role === UserRole.SUPER_ADMIN ||
      document.business.admin.userId === req.user.id);
  if (!canAccess) throw new AppError(404, "File not found");

  res.sendFile(path.resolve(process.cwd(), "uploads", fileName));
};
