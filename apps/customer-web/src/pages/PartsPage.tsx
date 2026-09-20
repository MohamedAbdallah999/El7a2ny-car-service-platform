import type { Product, ProductCategory, Vehicle } from "@car-platform/types";
import { Button, EmptyState, SearchBar, Tabs } from "@car-platform/ui-web";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cartApi, catalogApi, vehiclesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function PartsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const search = params.get("search") ?? "";
  const categoryId = params.get("categoryId") ?? "all";
  const sort = params.get("sort") ?? "price-asc";

  useEffect(() => {
    Promise.all([catalogApi.listCategories(), vehiclesApi.listMine()])
      .then(([categoryResult, vehicleResult]) => {
        setCategories(categoryResult.categories);
        setVehicle(
          vehicleResult.vehicles.find((item) => item.isPrimary) ??
            vehicleResult.vehicles[0] ??
            null,
        );
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .list({
        search: search || undefined,
        categoryId: categoryId === "all" ? undefined : categoryId,
        limit: 40,
      })
      .then(async (result) => {
        const detailedProducts = await Promise.all(
          result.items.map((product) =>
            catalogApi
              .getById(product.id)
              .then(({ product: detail }) => detail)
              .catch(() => product),
          ),
        );
        if (!cancelled) {
          setProducts(detailedProducts);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled)
          setError(getErrorMessage(reason, "Could not load products."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId, search]);

  const sortedProducts = useMemo(
    () =>
      [...products].sort((first, second) =>
        sort === "price-desc"
          ? Number(second.price) - Number(first.price)
          : Number(first.price) - Number(second.price),
      ),
    [products, sort],
  );

  function updateParam(key: string, value?: string) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  }

  function isCompatible(product: Product) {
    if (!vehicle || !product.vehicleCompatibilities?.length) return null;
    return product.vehicleCompatibilities.some(
      (item) =>
        (!item.makeId || item.makeId === vehicle.makeId) &&
        (!item.modelId || item.modelId === vehicle.modelId) &&
        (!item.yearFrom || vehicle.year >= item.yearFrom) &&
        (!item.yearTo || vehicle.year <= item.yearTo),
    );
  }

  async function addToCart(productId: string) {
    setAddingId(productId);
    setError(null);
    try {
      await cartApi.addItem(productId, 1);
      setAddedId(productId);
    } catch (reason) {
      setError(
        getErrorMessage(reason, "Could not add this product to your cart."),
      );
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="customer-page parts-page">
      <header className="customer-page__heading">
        <h1>Parts &amp; Products</h1>
        <p>Genuine and aftermarket parts from trusted suppliers</p>
      </header>
      {vehicle ? (
        <div className="parts-vehicle-banner">
          <span className="parts-vehicle-banner__check">✓</span>
          <p>
            Showing parts compatible with your{" "}
            <strong>
              {vehicle.make?.name} {vehicle.model?.name} {vehicle.year}
            </strong>
          </p>
          <button onClick={() => navigate("/cars")}>Change vehicle</button>
        </div>
      ) : null}
      <div className="parts-toolbar">
        <SearchBar
          icon={<Search size={15} />}
          placeholder="Search parts, brands, or SKU..."
          defaultValue={search}
          onSearch={(value) => updateParam("search", value || undefined)}
        />
        <select
          aria-label="Sort products"
          value={sort}
          onChange={(event) => updateParam("sort", event.target.value)}
        >
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
      <Tabs
        label="Product categories"
        value={categoryId}
        onValueChange={(value) =>
          updateParam("categoryId", value === "all" ? undefined : value)
        }
        items={[
          { value: "all", label: "All" },
          ...categories.map((category) => ({
            value: category.id,
            label: category.name,
          })),
        ]}
      />
      {error ? (
        <p role="alert" className="ui-field__message ui-field__message--error">
          {error}
        </p>
      ) : null}
      {isLoading ? (
        <p className="loading-block">Loading products…</p>
      ) : sortedProducts.length === 0 ? (
        <EmptyState title="No products found" />
      ) : (
        <div className="parts-grid">
          {sortedProducts.map((product) => {
            const compatibility = isCompatible(product);
            const image =
              product.images?.find((item) => item.isPrimary) ??
              product.images?.[0];
            return (
              <article className="part-card" key={product.id}>
                <button
                  className="part-card__image"
                  onClick={() => navigate(`/parts/${product.slug}`)}
                  aria-label={`View ${product.name}`}
                >
                  {image ? (
                    <img src={image.imageUrl} alt={image.altText ?? ""} />
                  ) : null}
                  {product.compareAtPrice ? (
                    <span className="part-card__sale">SALE</span>
                  ) : null}
                  {compatibility !== null ? (
                    <span
                      className={`part-card__fit part-card__fit--${compatibility ? "yes" : "check"}`}
                    >
                      {compatibility ? "✓ Compatible" : "⚠ Check fit"}
                    </span>
                  ) : null}
                </button>
                <div className="part-card__body">
                  <span className="part-card__brand">
                    {product.brand ?? product.category?.name}
                  </span>
                  <h2>{product.name}</h2>
                  <div className="part-card__footer">
                    <p>
                      <strong>
                        {Number(product.price)} {product.currency}
                      </strong>
                      {product.compareAtPrice ? (
                        <del>{Number(product.compareAtPrice)}</del>
                      ) : null}
                    </p>
                    <Button
                      size="xs"
                      loading={addingId === product.id}
                      onClick={() => void addToCart(product.id)}
                    >
                      {addedId === product.id ? "Added" : "Add to Cart"}
                    </Button>
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
