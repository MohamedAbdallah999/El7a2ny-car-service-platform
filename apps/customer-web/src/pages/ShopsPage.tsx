import type {
  BusinessSummary,
  ServiceCategory,
  ServiceSummary,
} from "@car-platform/types";
import {
  Badge,
  Button,
  EmptyState,
  SearchBar,
  StarRating,
} from "@car-platform/ui-web";
import { MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { businessesApi, servicesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function ShopsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const search = params.get("search") ?? "";
  const categoryId = params.get("categoryId") ?? "";
  const sort = params.get("sort") ?? "";

  useEffect(() => {
    Promise.all([
      servicesApi.list({ limit: 100 }),
      servicesApi.listCategories(),
    ])
      .then(([serviceResult, categoryResult]) => {
        setServices(serviceResult.items);
        setCategories(categoryResult.categories);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    businessesApi
      .list({ search: search || undefined, limit: 40 })
      .then((result) => {
        if (!cancelled) {
          setBusinesses(result.items);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled)
          setError(getErrorMessage(reason, "Could not load shops."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search]);

  const visibleBusinesses = useMemo(() => {
    const filtered = categoryId
      ? businesses.filter((business) =>
          services.some(
            (service) =>
              service.businessId === business.id &&
              service.categoryId === categoryId,
          ),
        )
      : businesses;
    return sort === "rating"
      ? [...filtered].sort(
          (a, b) => Number(b.averageRating) - Number(a.averageRating),
        )
      : filtered;
  }, [businesses, categoryId, services, sort]);

  function updateParam(key: string, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  }

  return (
    <div className="customer-page shops-page">
      <header className="customer-page__heading">
        <h1>Automotive Shops</h1>
        <p>Find trusted automotive businesses near you</p>
      </header>
      <div className="shops-toolbar">
        <SearchBar
          icon={<Search size={15} />}
          placeholder="Search by name, area, or service..."
          defaultValue={search}
          onSearch={(value) => updateParam("search", value)}
        />
        <select
          aria-label="Service"
          value={categoryId}
          onChange={(event) => updateParam("categoryId", event.target.value)}
        >
          <option value="">All Services</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select aria-label="Availability" defaultValue="">
          <option value="">Open Now</option>
        </select>
        <select
          aria-label="Sort"
          value={sort}
          onChange={(event) => updateParam("sort", event.target.value)}
        >
          <option value="">Default</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
      {isLoading ? (
        <p className="loading-block">Loading shops…</p>
      ) : error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : visibleBusinesses.length === 0 ? (
        <EmptyState
          title="No shops found"
          description="Try a different search or filter."
        />
      ) : (
        <div className="shops-grid">
          {visibleBusinesses.map((business) => {
            const shopServices = services.filter(
              (service) => service.businessId === business.id,
            );
            const bookableService = shopServices.find(
              (service) => service.isOnlineBooking,
            );
            const minimumPrice = shopServices.length
              ? Math.min(
                  ...shopServices.map((service) => Number(service.basePrice)),
                )
              : null;
            const branch =
              business.branches?.find((item) => item.isPrimary) ??
              business.branches?.[0];
            return (
              <article className="shop-result-card" key={business.id}>
                <div className="shop-result-card__image">
                  {business.coverImageUrl ? (
                    <img src={business.coverImageUrl} alt="" />
                  ) : null}
                  {business.verificationStatus === "VERIFIED" ? (
                    <Badge variant="success">✓ Verified</Badge>
                  ) : null}
                </div>
                <div className="shop-result-card__body">
                  <div className="shop-result-card__heading">
                    <h2>{business.name}</h2>
                    <StarRating
                      value={Number(business.averageRating)}
                      reviewCount={business.totalReviews}
                    />
                  </div>
                  {branch ? (
                    <>
                      <p className="shop-result-card__address">
                        <MapPin size={12} />
                        {branch.addressLine1}, {branch.city}
                      </p>
                      <p className="shop-result-card__distance">
                        {branch.city}
                      </p>
                    </>
                  ) : null}
                  {shopServices.length ? (
                    <div className="shop-result-card__services">
                      {shopServices.slice(0, 3).map((service) => (
                        <span key={service.id}>{service.name}</span>
                      ))}
                    </div>
                  ) : null}
                  <div className="shop-result-card__footer">
                    <p>
                      {minimumPrice === null ? (
                        "Services available"
                      ) : (
                        <>
                          From{" "}
                          <strong>
                            {minimumPrice} {shopServices[0]?.currency}
                          </strong>
                        </>
                      )}
                    </p>
                    <div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/shops/${business.slug}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        disabled={!bookableService}
                        onClick={() =>
                          bookableService &&
                          navigate(`/book/${business.id}/${bookableService.id}`)
                        }
                      >
                        Book
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
