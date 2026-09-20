import type { AuthTokenPayload } from "@car-platform/types";

// Decodes (never verifies — there is no secret on the client) a JWT payload
// segment using a dependency-free base64url decoder. Deliberately avoids
// `atob`/`Buffer`: neither is guaranteed to exist in every runtime this
// package targets (web, React Native without polyfills, Node), so this
// stays a pure algorithm instead of relying on a host global.
const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const decodeBase64Url = (segment: string): string => {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");

  let buffer = 0;
  let bits = 0;
  const bytes: number[] = [];

  for (const char of base64) {
    const value = BASE64_ALPHABET.indexOf(char);
    if (value === -1) {
      continue;
    }
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return typeof TextDecoder !== "undefined"
    ? new TextDecoder().decode(Uint8Array.from(bytes))
    : decodeUtf8Fallback(bytes);
};

// Only reached in an environment with neither `atob`/`Buffer` (already
// avoided above) nor `TextDecoder` — extremely unlikely, but this keeps the
// function total rather than throwing on ASCII-only payloads.
const decodeUtf8Fallback = (bytes: number[]): string =>
  bytes.map((byte) => String.fromCharCode(byte)).join("");

export const decodeJwtPayload = <T = AuthTokenPayload>(
  token: string,
): T | null => {
  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payloadSegment)) as T;
  } catch {
    return null;
  }
};

export const decodeJwtExpiry = (token: string): Date | null => {
  const payload = decodeJwtPayload<{ exp?: number }>(token);
  return typeof payload?.exp === "number" ? new Date(payload.exp * 1000) : null;
};

export const isTokenExpired = (token: string, skewSeconds = 0): boolean => {
  const expiry = decodeJwtExpiry(token);
  return !expiry || expiry.getTime() <= Date.now() + skewSeconds * 1000;
};
