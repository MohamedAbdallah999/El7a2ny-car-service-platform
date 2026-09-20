import { UserRole } from "../../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
      validatedQuery?: Record<string, unknown>;
    }
  }
}

export {};
