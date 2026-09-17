import type { BusinessSummary } from "@car-platform/types";
import { EmptyState, PageHeader, SearchBar, ShopCard } from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { businessesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function ShopsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.get("search") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;

  useEffect(() => {
    let cancelled = false;
    businessesApi
      .list({ search, limit: 40 })
      .then((result) => {
        if (!cancelled) {
          setBusinesses(result.items);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load shops."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, categoryId]);

  return (
    <div className="form-stack" style={{ gap: "1.5rem" }}>
      <PageHeader title="Shops" subtitle="Browse verified car service businesses" />
      <SearchBar
        placeholder="Search shops"
        defaultValue={search}
        onSearch={(value) =>
          setSearchParams(value ? { search: value } : {})
        }
      />

      {isLoading ? (
        <p className="loading-block">Loading shops…</p>
      ) : error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : businesses.length === 0 ? (
        <EmptyState
          title="No shops found"
          description="Try a different search term."
        />
      ) : (
        <div className="page-grid page-grid--3col">
          {businesses.map((business) => (
            <ShopCard
              key={business.id}
              name={business.name}
              imageSrc={business.coverImageUrl ?? undefined}
              rating={Number(business.averageRating)}
              reviewCount={business.totalReviews}
              verified={business.verificationStatus === "VERIFIED"}
              distance={business.branches?.[0]?.city}
              onClick={() => navigate(`/shops/${business.slug}`)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
