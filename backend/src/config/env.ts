const parseCorsOrigins = (): Set<string> =>
  new Set(
    (process.env.CORS_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

export const corsOrigins = parseCorsOrigins();

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be configured with at least 32 characters",
    );
  }

  return secret;
};

export const env = {
  get databaseUrl(): string | undefined {
    return process.env.DATABASE_URL;
  },
  get jwtSecret(): string {
    return getJwtSecret();
  },
  get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN ?? "15m";
  },
  get port(): number {
    return Number(process.env.PORT ?? 4000);
  },
  get twilioAccountSid(): string | undefined {
    return process.env.TWILIO_ACCOUNT_SID;
  },
  get twilioAuthToken(): string | undefined {
    return process.env.TWILIO_AUTH_TOKEN;
  },
  get twilioVerifyServiceSid(): string | undefined {
    return process.env.TWILIO_VERIFY_SERVICE_SID;
  },
};

export const validateEnvironment = (): void => {
  getJwtSecret();

  if (process.env.NODE_ENV === "production" && corsOrigins.size === 0) {
    throw new Error(
      "CORS_ORIGINS must list the permitted web application origins",
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    (!env.twilioAccountSid ||
      !env.twilioAuthToken ||
      !env.twilioVerifyServiceSid)
  ) {
    throw new Error("Twilio Verify must be configured in production");
  }
};
