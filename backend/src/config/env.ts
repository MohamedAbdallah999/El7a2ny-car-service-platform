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
  get nodeEnv(): string {
    return process.env.NODE_ENV ?? "development";
  },
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
  get emailVerificationProvider(): "local" | "resend" {
    const provider =
      process.env.EMAIL_VERIFICATION_PROVIDER ??
      (this.nodeEnv === "production" ? "resend" : "local");

    if (provider !== "local" && provider !== "resend") {
      throw new Error(
        "EMAIL_VERIFICATION_PROVIDER must be either local or resend",
      );
    }

    return provider;
  },
  get localEmailVerificationCode(): string {
    return process.env.LOCAL_EMAIL_VERIFICATION_CODE ?? "123456";
  },
  get resendApiKey(): string | undefined {
    return process.env.RESEND_API_KEY;
  },
  get resendFromEmail(): string | undefined {
    return process.env.RESEND_FROM_EMAIL;
  },
};

export const validateEnvironment = (): void => {
  getJwtSecret();

  if (
    env.emailVerificationProvider === "local" &&
    !/^\d{4,10}$/.test(env.localEmailVerificationCode)
  ) {
    throw new Error(
      "LOCAL_EMAIL_VERIFICATION_CODE must contain 4 to 10 digits",
    );
  }

  if (env.nodeEnv === "production" && corsOrigins.size === 0) {
    throw new Error(
      "CORS_ORIGINS must list the permitted web application origins",
    );
  }

  if (
    env.nodeEnv === "production" &&
    env.emailVerificationProvider === "local"
  ) {
    throw new Error("Local email verification cannot be used in production");
  }

  if (
    env.emailVerificationProvider === "resend" &&
    (!env.resendApiKey || !env.resendFromEmail)
  ) {
    throw new Error(
      "Resend email verification must be configured when selected",
    );
  }
};
