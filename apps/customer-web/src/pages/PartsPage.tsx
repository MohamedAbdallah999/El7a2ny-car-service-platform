import type { Product, ProductCategory } from "@car-platform/types";
import { Badge, Card, EmptyState, PageHeader, SearchBar } from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { catalogApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function PartsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.get("search") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;

  useEffect(() => {
    catalogApi.listCategories().then(({ categories: cats }) => setCategories(cats));
  }, []);

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .list({ search, categoryId, limit: 40 })
      .then((result) => {
        if (!cancelled) {
          setProducts(result.items);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load products."));
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
      <PageHeader title="Parts & Accessories" subtitle="Genuine parts from verified sellers" />
      <SearchBar
        placeholder="Search parts"
        defaultValue={search}
        onSearch={(value) =>
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value) next.set("search", value);
            else next.delete("search");
            return next;
          })
        }
      />

      {categories.length > 0 ? (
        <div className="inline-actions">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`app-header__link${categoryId === category.id ? " app-header__link--active" : ""}`}
              onClick={() =>
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (categoryId === category.id) next.delete("categoryId");
                  else next.set("categoryId", category.id);
                  return next;
                })
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <p className="loading-block">Loading products…</p>
      ) : error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : products.length === 0 ? (
        <EmptyState title="No products found" />
      ) : (
        <div className="page-grid page-grid--3col">
          {products.map((product) => (
            <Card
              key={product.id}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/parts/${product.slug}`)}
            >
              {product.images?.[0] ? (
                <img
                  src={product.images[0].imageUrl}
                  alt=""
                  style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                />
              ) : null}
              <div style={{ marginTop: "0.75rem" }}>
                {product.brand ? <Badge variant="muted">{product.brand}</Badge> : null}
                <h4 style={{ marginTop: "0.5rem" }}>{product.name}</h4>
                <p style={{ marginTop: "0.25rem" }}>
                  <strong>{product.price}</strong> {product.currency}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
