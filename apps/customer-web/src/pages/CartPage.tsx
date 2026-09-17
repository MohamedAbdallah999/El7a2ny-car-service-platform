import type { CartSummary } from "@car-platform/types";
import { Button, Card, EmptyState, Input, PageHeader } from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function CartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cartApi
      .get()
      .then(setSummary)
      .catch((err) => setError(getErrorMessage(err, "Could not load your cart.")))
      .finally(() => setIsLoading(false));
  }, []);

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    const result = await cartApi.updateItem(itemId, quantity);
    setSummary(result);
  }

  async function removeItem(itemId: string) {
    const result = await cartApi.removeItem(itemId);
    setSummary(result);
  }

  if (isLoading) {
    return <p className="loading-block">Loading your cart…</p>;
  }

  if (error) {
    return <EmptyState title="Something went wrong" description={error} />;
  }

  const items = summary?.cart.items ?? [];

  return (
    <div className="form-stack" style={{ gap: "1.5rem" }}>
      <PageHeader title="Your Cart" />

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse parts and accessories to get started."
          action={<Button onClick={() => navigate("/parts")}>Shop parts</Button>}
        />
      ) : (
        <>
          <div className="form-stack">
            {items.map((item) => (
              <Card key={item.id} className="spread-row">
                <div>
                  <strong>{item.product.name}</strong>
                  <p className="muted-text">
                    {item.unitPrice} {item.product.currency} each
                  </p>
                </div>
                <div className="inline-actions">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.id, Number(event.target.value))
                    }
                    style={{ maxWidth: "5rem" }}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="spread-row">
            <strong>Subtotal</strong>
            <strong>{summary?.subtotal.toFixed(2)}</strong>
          </Card>

          <Button fullWidth onClick={() => navigate("/checkout")}>
            Proceed to checkout
          </Button>
        </>
      )}
    </div>
  );
}
