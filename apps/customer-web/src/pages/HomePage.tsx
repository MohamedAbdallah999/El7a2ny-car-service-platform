import type { BusinessSummary, ServiceCategory } from "@car-platform/types";
import {
  Chip,
  EmptyState,
  PageHeader,
  SearchBar,
  ShopCard,
} from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { businessesApi, servicesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      servicesApi.listCategories(),
      businessesApi.list({ limit: 8 }),
    ])
      .then(([categoryResult, businessResult]) => {
        if (cancelled) return;
        setCategories(categoryResult.categories);
        setBusinesses(businessResult.items);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load the homepage."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearch(value: string) {
    if (value.trim()) {
      navigate(`/shops?search=${encodeURIComponent(value.trim())}`);
    }
  }

  return (
    <div className="form-stack" style={{ gap: "2rem" }}>
      <section>
        <PageHeader
          title="Find trusted car care near you"
          subtitle="Book services and shop genuine parts from verified businesses."
        />
        <SearchBar
          variant="hero"
          placeholder="Search for a service, shop, or product"
          onSearch={handleSearch}
        />
      </section>

      {error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : null}

      {categories.length > 0 ? (
        <section>
          <h3 style={{ marginBottom: "1rem" }}>Browse by category</h3>
          <div className="inline-actions">
            {categories.map((category) => (
              <Chip
                key={category.id}
                onActivate={() =>
                  navigate(`/shops?categoryId=${category.id}`)
                }
              >
                {category.name}
              </Chip>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="spread-row" style={{ marginBottom: "1rem" }}>
          <h3>Featured shops</h3>
          <button
            type="button"
            onClick={() => navigate("/shops")}
            className="muted-text"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            View all
          </button>
        </div>

        {isLoading ? (
          <p className="loading-block">Loading shops…</p>
        ) : businesses.length === 0 ? (
          <EmptyState
            title="No shops yet"
            description="Check back soon — new businesses are joining the platform."
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
      </section>
    </div>
  );
}
