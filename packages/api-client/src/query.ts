// Builds a leading-"?" query string from a params object, dropping
// undefined/null/empty-string values so callers can pass optional filters
// straight through without pre-filtering. Typed as the bare `object` rather
// than `Record<string, ...>`: TypeScript only treats a type as assignable
// to `Record<K, V>` if it declares its own index signature, which named
// params interfaces like `ListBookingsParams` don't — `object` has no such
// restriction, and the runtime `typeof` checks below do the real filtering.
export const toQueryString = (params: object): string => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (
      (typeof value !== "string" &&
        typeof value !== "number" &&
        typeof value !== "boolean") ||
      value === ""
    ) {
      continue;
    }
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
};
