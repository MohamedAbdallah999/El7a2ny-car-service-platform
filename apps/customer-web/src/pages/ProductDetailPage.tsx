import type { Product } from "@car-platform/types";
import { Badge, Button, EmptyState, Input } from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cartApi, catalogApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    catalogApi
      .getBySlug(slug)
      .then(({ product: found }) => {
        if (!cancelled) setProduct(found);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Product not found."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleAddToCart() {
    if (!product) return;
    setIsAdding(true);
    setAddedMessage(null);
    try {
      await cartApi.addItem(product.id, quantity);
      setAddedMessage("Added to cart.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not add this item to your cart."));
    } finally {
      setIsAdding(false);
    }
  }

  if (isLoading) {
    return <p className="loading-block">Loading…</p>;
  }

  if (error || !product) {
    return <EmptyState title="Product not found" description={error ?? undefined} />;
  }

  return (
    <div className="page-grid" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", alignItems: "start" }}>
      <div>
        {product.images?.[0] ? (
          <img
            src={product.images[0].imageUrl}
            alt=""
            style={{ width: "100%", borderRadius: "var(--radius-lg)" }}
          />
        ) : null}
      </div>

      <div className="form-stack">
        {product.brand ? <Badge variant="muted">{product.brand}</Badge> : null}
        <h1>{product.name}</h1>
        <p className="muted-text">SKU: {product.sku}</p>
        <p style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-black)" }}>
          {product.price} {product.currency}
        </p>
        {product.description ? <p>{product.description}</p> : null}

        <div className="inline-actions">
          <Input
            type="number"
            label="Quantity"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
            style={{ maxWidth: "6rem" }}
          />
        </div>

        {addedMessage ? (
          <p className="ui-field__message">{addedMessage}</p>
        ) : null}

        <div className="inline-actions">
          <Button loading={isAdding} onClick={handleAddToCart}>
            Add to cart
          </Button>
          <Button variant="secondary" onClick={() => navigate("/cart")}>
            View cart
          </Button>
        </div>
      </div>
    </div>
  );
}
