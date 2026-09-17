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

// `request.query` is read-only in Express 5 (it's a getter over the parsed
// URL), so the validated/coerced result is stashed on `request.validatedQuery`
// instead of being written back to `request.query`.
export const validateQuery = (
  schema: ZodType,
  errorMessage: string,
  includeDetails = false,
) => {
  return (request: Request, response: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(request.query);

    if (!parsed.success) {
      response.status(400).json({
        error: errorMessage,
        ...(includeDetails
          ? { details: parsed.error.flatten().fieldErrors }
          : {}),
      });
      return;
    }

    request.validatedQuery = parsed.data as Record<string, unknown>;
    next();
  };
};
