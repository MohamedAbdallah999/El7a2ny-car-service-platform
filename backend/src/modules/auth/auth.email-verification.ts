import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";
import { AppError } from "../../errors/app-error.js";

const resendEmailsUrl = "https://api.resend.com/emails";
const codeLifetimeMs = 10 * 60 * 1000;

const createVerificationCode = (email: string, time = Date.now()): string => {
  const timeWindow = Math.floor(time / codeLifetimeMs);
  const digest = createHmac("sha256", env.jwtSecret)
    .update(`${email.toLowerCase()}:${timeWindow}`)
    .digest();
  return (digest.readUInt32BE(0) % 1_000_000).toString().padStart(6, "0");
};

const codesMatch = (expected: string, received: string): boolean => {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

const getResendConfiguration = () => {
  const { resendApiKey: apiKey, resendFromEmail: from } = env;
  if (!apiKey || !from) {
    throw new AppError(503, "Email verification is not configured");
  }

  return { apiKey, from };
};

const sendWithResend = async (email: string, code: string): Promise<void> => {
  const { apiKey, from } = getResendConfiguration();
  let response: Response;
  try {
    response = await fetch(resendEmailsUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Your El7a2ny verification code",
        text: `Your El7a2ny verification code is ${code}. It expires in 10 minutes.`,
        html: `<p>Your El7a2ny verification code is:</p><p style="font-size: 24px; font-weight: 700; letter-spacing: 4px">${code}</p><p>It expires in 10 minutes.</p>`,
      }),
    });
  } catch {
    throw new AppError(503, "Email verification is temporarily unavailable");
  }

  if (!response.ok) {
    throw new AppError(503, "Email verification is temporarily unavailable");
  }
};

export const emailVerification = {
  async sendCode(
    email: string,
  ): Promise<{ developmentVerificationCode?: string }> {
    if (env.emailVerificationProvider === "local") {
      return { developmentVerificationCode: env.localEmailVerificationCode };
    }

    await sendWithResend(email, createVerificationCode(email));
    return {};
  },

  async checkCode(email: string, code: string): Promise<boolean> {
    if (env.emailVerificationProvider === "local") {
      return codesMatch(env.localEmailVerificationCode, code);
    }

    return [Date.now(), Date.now() - codeLifetimeMs].some((time) =>
      codesMatch(createVerificationCode(email, time), code),
    );
  },
};
