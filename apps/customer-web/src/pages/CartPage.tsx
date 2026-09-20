import type { CartSummary, Product, Vehicle } from "@car-platform/types";
import { Button, EmptyState } from "@car-platform/ui-web";
import { Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartApi, vehiclesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

function formatAmount(amount: number | string) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function primaryImage(product: Product) {
  return (
    product.images?.find((image) => image.isPrimary) ?? product.images?.[0]
  );
}

function fitsVehicle(product: Product, vehicle: Vehicle | null) {
  if (!vehicle || !product.vehicleCompatibilities?.length) return null;
  return product.vehicleCompatibilities.some(
    (rule) =>
      (!rule.makeId || rule.makeId === vehicle.makeId) &&
      (!rule.modelId || rule.modelId === vehicle.modelId) &&
      (!rule.yearFrom || vehicle.year >= rule.yearFrom) &&
      (!rule.yearTo || vehicle.year <= rule.yearTo),
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([cartApi.get(), vehiclesApi.listMine()])
      .then(([cart, vehicleResult]) => {
        setSummary(cart);
        setVehicle(
          vehicleResult.vehicles.find((item) => item.isPrimary) ??
            vehicleResult.vehicles[0] ??
            null,
        );
      })
      .catch((reason: unknown) =>
        setError(getErrorMessage(reason, "Could not load your cart.")),
      )
      .finally(() => setIsLoading(false));
  }, []);

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1 || updatingId) return;
    setUpdatingId(itemId);
    setError(null);
    try {
      setSummary(await cartApi.updateItem(itemId, quantity));
      window.dispatchEvent(new Event("cart-updated"));
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not update this item."));
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(itemId: string) {
    if (updatingId) return;
    setUpdatingId(itemId);
    setError(null);
    try {
      setSummary(await cartApi.removeItem(itemId));
      window.dispatchEvent(new Event("cart-updated"));
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not remove this item."));
    } finally {
      setUpdatingId(null);
    }
  }

  if (isLoading) {
    return <p className="loading-block">Loading your cart…</p>;
  }

  if (error && !summary) {
    return <EmptyState title="Something went wrong" description={error} />;
  }

  const items = summary?.cart.items ?? [];
  const currency = items[0]?.product.currency ?? "EGP";

  return (
    <div className="customer-page cart-page">
      <header className="customer-page__heading">
        <h1>
          Your Cart ({summary?.itemCount ?? 0}{" "}
          {(summary?.itemCount ?? 0) === 1 ? "item" : "items"})
        </h1>
      </header>

      {error ? (
        <p role="alert" className="ui-field__message ui-field__message--error">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse parts and accessories to get started."
          action={
            <Button onClick={() => navigate("/parts")}>Shop parts</Button>
          }
        />
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => {
              const image = primaryImage(item.product);
              const compatible = fitsVehicle(item.product, vehicle);
              const vehicleName = vehicle
                ? `${vehicle.make?.name ?? ""} ${vehicle.model?.name ?? ""} ${vehicle.year}`.trim()
                : null;

              return (
                <article className="cart-item" key={item.id}>
                  <div className="cart-item__image">
                    {image ? (
                      <img
                        src={image.imageUrl}
                        alt={image.altText ?? item.product.name}
                      />
                    ) : (
                      <ImageIcon size={24} aria-hidden="true" />
                    )}
                  </div>
                  <div className="cart-item__content">
                    <p className="cart-item__brand">
                      {item.product.brand ??
                        item.product.business?.name ??
                        "Part"}
                    </p>
                    <h2>{item.product.name}</h2>
                    {compatible !== null && vehicleName ? (
                      <p
                        className={`cart-item__fit cart-item__fit--${compatible ? "yes" : "no"}`}
                      >
                        {compatible ? "✓ Compatible with" : "Check fit for"}{" "}
                        {vehicleName}
                      </p>
                    ) : null}
                    <div className="cart-item__controls">
                      <div className="cart-quantity" aria-label="Quantity">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.product.name} quantity`}
                          disabled={
                            item.quantity === 1 || updatingId === item.id
                          }
                          onClick={() =>
                            void updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.product.name} quantity`}
                          disabled={updatingId === item.id}
                          onClick={() =>
                            void updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-item__remove"
                        disabled={updatingId === item.id}
                        onClick={() => void removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <strong className="cart-item__price">
                    {formatAmount(Number(item.unitPrice) * item.quantity)}{" "}
                    {item.product.currency}
                  </strong>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>
            <dl>
              <div>
                <dt>Subtotal</dt>
                <dd>
                  {formatAmount(summary?.subtotal ?? 0)} {currency}
                </dd>
              </div>
              <div>
                <dt>Delivery fee</dt>
                <dd>Free</dd>
              </div>
              <div>
                <dt>Discount</dt>
                <dd className="cart-summary__discount">0 {currency}</dd>
              </div>
            </dl>
            <div className="cart-summary__total">
              <span>Total</span>
              <strong>
                {formatAmount(summary?.subtotal ?? 0)} {currency}
              </strong>
            </div>
            <Button fullWidth onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </Button>
            <Button
              fullWidth
              variant="secondary"
              onClick={() => navigate("/parts")}
            >
              Continue Shopping
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
