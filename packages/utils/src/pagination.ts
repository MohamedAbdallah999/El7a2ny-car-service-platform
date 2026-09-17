import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@car-platform/constants";
import type { PaginationMeta } from "@car-platform/types";

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

// Clamps arbitrary/untrusted page & limit input (e.g. raw query string
// values) into safe bounds, and derives the Prisma `skip`/`take` pair from
// them so every module paginates the same way.
export const normalizePagination = (input: {
  page?: number;
  limit?: number;
}): NormalizedPagination => {
  const page =
    Number.isInteger(input.page) && (input.page as number) > 0
      ? (input.page as number)
      : DEFAULT_PAGE;
  const limit =
    Number.isInteger(input.limit) && (input.limit as number) > 0
      ? Math.min(input.limit as number, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  return { page, limit, skip: (page - 1) * limit, take: limit };
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / limit),
});
