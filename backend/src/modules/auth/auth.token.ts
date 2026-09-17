import jwt, {
  type JwtPayload as JsonWebTokenPayload,
  type SignOptions,
} from "jsonwebtoken";
import { env } from "../../config/env.js";
import { UserRole } from "../../generated/prisma/client.js";

const JWT_ISSUER = "el7a2ny-api";
const JWT_AUDIENCE = "el7a2ny-clients";

const getJwtExpiresIn = (): SignOptions["expiresIn"] =>
  env.jwtExpiresIn as SignOptions["expiresIn"];

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: "HS256",
    audience: JWT_AUDIENCE,
    expiresIn: getJwtExpiresIn(),
    issuer: JWT_ISSUER,
    subject: payload.userId,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.jwtSecret, {
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
