export interface ApiClientOptions {
  baseUrl: string;
  fetchImplementation?: typeof fetch;
}

export interface ApiClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

export function createApiClient({
  baseUrl,
  fetchImplementation = fetch,
}: ApiClientOptions): ApiClient {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  return {
    async request<T>(path: string, init?: RequestInit) {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      const response = await fetchImplementation(
        `${normalizedBaseUrl}${normalizedPath}`,
        init,
      );

      if (!response.ok) {
        throw new Error(`HTTP request failed with status ${response.status}`);
      }

      return (await response.json()) as T;
    },
  };
}
