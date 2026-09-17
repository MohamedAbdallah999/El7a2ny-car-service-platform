import type { ApiErrorResponse } from "@car-platform/types";

export class ApiClientError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  fetchImplementation?: typeof fetch;
  // Injected per-app (reads from @car-platform/auth's TokenStorage, or
  // whatever an app already uses) so this package never depends on a
  // storage mechanism itself.
  getAccessToken?: () => string | null | Promise<string | null>;
}

export interface ApiClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

const isErrorResponse = (value: unknown): value is ApiErrorResponse =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as ApiErrorResponse).error === "string";

export function createApiClient({
  baseUrl,
  fetchImplementation = fetch,
  getAccessToken,
}: ApiClientOptions): ApiClient {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  return {
    async request<T>(path: string, init: RequestInit = {}): Promise<T> {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      const token = await getAccessToken?.();

      const headers = new Headers(init.headers);
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const response = await fetchImplementation(
        `${normalizedBaseUrl}${normalizedPath}`,
        { ...init, headers },
      );

      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const body = isJson ? await response.json() : undefined;

      if (!response.ok) {
        const message = isErrorResponse(body)
          ? body.error
          : `HTTP request failed with status ${response.status}`;
        throw new ApiClientError(response.status, message);
      }

      return body as T;
    },
  };
}
