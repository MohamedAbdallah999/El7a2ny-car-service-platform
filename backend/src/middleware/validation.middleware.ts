import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export const validateBody = (
  schema: ZodType,
  errorMessage: string,
  includeDetails = false,
) => {
  return (request: Request, response: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        error: errorMessage,
        ...(includeDetails
          ? { details: parsed.error.flatten().fieldErrors }
          : {}),
      });
      return;
    }

    request.body = parsed.data;
    next();
  };
};
