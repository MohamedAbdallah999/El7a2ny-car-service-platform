import { env } from "../../config/env.js";
import { AppError } from "../../errors/app-error.js";

const verifyBaseUrl = "https://verify.twilio.com/v2/Services";

const getConfiguration = () => {
  const {
    twilioAccountSid: accountSid,
    twilioAuthToken: authToken,
    twilioVerifyServiceSid: serviceSid,
  } = env;

  if (!accountSid || !authToken || !serviceSid) {
    throw new AppError(503, "Phone verification is not configured");
  }

  return { accountSid, authToken, serviceSid };
};

const requestVerification = async (
  path: string,
  parameters: URLSearchParams,
): Promise<{ status: string }> => {
  const { accountSid, authToken, serviceSid } = getConfiguration();
  const authorization = Buffer.from(`${accountSid}:${authToken}`).toString(
    "base64",
  );

  let response: Response;
  try {
    response = await fetch(`${verifyBaseUrl}/${serviceSid}/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: parameters,
    });
  } catch {
    throw new AppError(503, "Phone verification is temporarily unavailable");
  }

  if (!response.ok) {
    throw new AppError(503, "Phone verification is temporarily unavailable");
  }

  return response.json() as Promise<{ status: string }>;
};

export const phoneVerification = {
  async sendCode(phone: string): Promise<void> {
    await requestVerification(
      "Verifications",
      new URLSearchParams({ channel: "sms", to: phone }),
    );
  },

  async checkCode(phone: string, code: string): Promise<boolean> {
    const verification = await requestVerification(
      "VerificationCheck",
      new URLSearchParams({ code, to: phone }),
    );

    return verification.status === "approved";
  },
};
