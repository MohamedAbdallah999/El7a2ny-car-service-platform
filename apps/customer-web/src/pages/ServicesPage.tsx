import type { ServiceCategory, ServiceSummary } from "@car-platform/types";
import { Button, EmptyState, SearchBar, Tabs } from "@car-platform/ui-web";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { servicesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function ServicesPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categoryId = params.get("categoryId") ?? "all";
  const search = params.get("search") ?? "";

  useEffect(() => {
    servicesApi
      .listCategories()
      .then(({ categories: items }) => setCategories(items));
  }, []);

  useEffect(() => {
    let cancelled = false;
    servicesApi
      .list({
        categoryId: categoryId === "all" ? undefined : categoryId,
        search: search || undefined,
        limit: 40,
      })
      .then((result) => {
        if (!cancelled) {
          setServices(result.items);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled)
          setError(getErrorMessage(reason, "Could not load services."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId, search]);

  function updateParam(key: string, value?: string) {
    setLoading(true);
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  }

  function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} min`;
    const hours = minutes / 60;
    return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} ${hours === 1 ? "hr" : "hrs"}`;
  }

  return (
    <div className="customer-page services-page">
      <header className="customer-page__heading">
        <h1>Find Services</h1>
        <p>Browse all automotive services available near you</p>
      </header>
      <div className="catalog-toolbar">
        <SearchBar
          icon={<Search size={15} />}
          placeholder="Search services..."
          defaultValue={search}
          onSearch={(value) => updateParam("search", value || undefined)}
        />
        <select aria-label="Distance" defaultValue="">
          <option value="">Any Distance</option>
        </select>
        <select aria-label="Rating" defaultValue="">
          <option value="">Any Rating</option>
        </select>
        <select aria-label="Price" defaultValue="">
          <option value="">Any Price</option>
        </select>
      </div>
      <Tabs
        label="Service categories"
        items={[
          { value: "all", label: "All" },
          ...categories.map((item) => ({ value: item.id, label: item.name })),
        ]}
        value={categoryId}
        onValueChange={(value) =>
          updateParam("categoryId", value === "all" ? undefined : value)
        }
      />
      {loading ? (
        <p className="loading-block">Loading services…</p>
      ) : error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : services.length === 0 ? (
        <EmptyState title="No services found" />
      ) : (
        <div className="service-list">
          {services.map((service) => (
            <article className="service-row" key={service.id}>
              <div className="service-row__header">
                <div>
                  <span className="customer-kicker">
                    {categories.find((item) => item.id === service.categoryId)
                      ?.name ?? "Automotive service"}
                  </span>
                  <h2>{service.name}</h2>
                </div>
                <div className="service-row__price">
                  <strong>
                    {Number(service.basePrice) === 0
                      ? "Free"
                      : `${Number(service.basePrice)} ${service.currency}`}
                  </strong>
                  <small>{formatDuration(service.durationMinutes)}</small>
                </div>
              </div>
              {service.description ? (
                <p className="service-row__description">
                  {service.description}
                </p>
              ) : null}
              {!service.isOnlineBooking ? (
                <p className="service-row__warning">
                  Currently unavailable at this shop
                </p>
              ) : null}
              <Button
                variant="dark"
                size="sm"
                fullWidth
                disabled={!service.isOnlineBooking || !service.businessId}
                onClick={() =>
                  navigate(`/book/${service.businessId}/${service.id}`)
                }
              >
                Book This Service
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
