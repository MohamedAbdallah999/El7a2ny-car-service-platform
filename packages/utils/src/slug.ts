// Used for Business.slug, ServiceCategory.slug, ProductCategory.slug, and
// Product.slug — all unique, URL-safe identifiers derived from a name.
export const slugify = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const MAX_UNIQUE_SLUG_ATTEMPTS = 5;

// Shared by every module with a unique `slug` column (Business,
// ServiceCategory, ProductCategory, Product): tries the plain slug first,
// then appends a short random suffix on collision. `exists` is the
// caller's own uniqueness check (a DB lookup), kept out of this package
// since it has no database dependency.
export const generateUniqueSlug = async (
  name: string,
  exists: (candidate: string) => Promise<boolean>,
): Promise<string> => {
  const base = slugify(name);

  for (let attempt = 0; attempt < MAX_UNIQUE_SLUG_ATTEMPTS; attempt += 1) {
    const candidate =
      attempt === 0
        ? base
        : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    if (!(await exists(candidate))) {
      return candidate;
    }
  }

  throw new Error(`Could not generate a unique slug for "${name}"`);
};
