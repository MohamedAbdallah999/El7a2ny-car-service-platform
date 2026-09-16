import jwt, { type JwtPayload as JsonWebTokenPayload, type SignOptions } from "jsonwebtoken";
import { UserRole } from "../generated/prisma/client.js";

const JWT_ISSUER = "el7a2ny-api";
const JWT_AUDIENCE = "el7a2ny-clients";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }

  return secret;
};

const getJwtExpiresIn = (): SignOptions["expiresIn"] =>
  (process.env.JWT_EXPIRES_IN ?? "15m") as SignOptions["expiresIn"];

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: "HS256",
    audience: JWT_AUDIENCE,
    expiresIn: getJwtExpiresIn(),
    issuer: JWT_ISSUER,
    subject: payload.userId,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
  });

  if (typeof decoded === "string" || !isValidPayload(decoded)) {
    throw new Error("Invalid token payload");
  }

  return { userId: decoded.userId, role: decoded.role };
};

const isValidPayload = (
  payload: JsonWebTokenPayload,
): payload is JsonWebTokenPayload & JwtPayload =>
  typeof payload.userId === "string" &&
  payload.sub === payload.userId &&
  Object.values(UserRole).includes(payload.role as UserRole);
