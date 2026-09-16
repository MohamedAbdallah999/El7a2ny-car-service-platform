const parseCorsOrigins = (): Set<string> =>
  new Set(
    (process.env.CORS_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

export const corsOrigins = parseCorsOrigins();

export const validateEnvironment = (): void => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }

  if (process.env.NODE_ENV === "production" && corsOrigins.size === 0) {
    throw new Error("CORS_ORIGINS must list the permitted web application origins");
  }
};
