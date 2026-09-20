import type { CartSummary, CustomerAddress, Order } from "@car-platform/types";
import { Button, EmptyState } from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddressForm } from "../components/AddressForm";
import { addressesApi, cartApi, ordersApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

function formatAmount(value: number | string) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [customerNotes, setCustomerNotes] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    Promise.all([addressesApi.list(), cartApi.get()])
      .then(([addressResult, cartResult]) => {
        const list = addressResult.addresses;
        setAddresses(list);
        setCart(cartResult);
        setSelectedAddressId(
          list.find((address) => address.isDefault)?.id ?? list[0]?.id ?? null,
        );
        setIsAddingAddress(list.length === 0);
      })
      .catch((reason: unknown) =>
        setError(getErrorMessage(reason, "Could not load checkout.")),
      )
      .finally(() => setIsLoading(false));
  }, []);

  async function handleAddAddress(
    payload: Parameters<typeof addressesApi.create>[0],
  ) {
    setError(null);
    setIsSavingAddress(true);
    try {
      const { address } = await addressesApi.create(payload);
      setAddresses((current) => [
        address,
        ...current.map((item) =>
          address.isDefault ? { ...item, isDefault: false } : item,
        ),
      ]);
      setSelectedAddressId(address.id);
      setIsAddingAddress(false);
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not save this address."));
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId || !cart?.cart.items.length) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await ordersApi.checkout({
        shippingAddressId: selectedAddressId,
        customerNotes: customerNotes.trim() || undefined,
      });
      setOrder(result.order);
      setCart(null);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not place this order."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <p className="loading-block">Loading checkout…</p>;

  if (order) {
    return (
      <div className="checkout-success">
        <div className="checkout-success__check" aria-hidden="true">
          ✓
        </div>
        <h1>Order Placed!</h1>
        <p>Your order has been saved and is now being prepared.</p>
        <div className="checkout-success__reference">
          <span>Order Reference</span>
          <strong>{order.orderNumber}</strong>
        </div>
        <div className="checkout-success__actions">
          <Button variant="secondary" onClick={() => navigate("/orders")}>
            View Orders
          </Button>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const items = cart?.cart.items ?? [];
  if (!error && items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add parts to your cart before checking out."
        action={
          <Button onClick={() => navigate("/parts")}>Browse Parts</Button>
        }
      />
    );
  }

  const currency = items[0]?.product.currency ?? "EGP";

  return (
    <div className="checkout-page">
      <header className="customer-page__heading">
        <h1>Checkout</h1>
        <p>Confirm your delivery address and order details.</p>
      </header>

      {error ? (
        <p
          role="alert"
          className="ui-field__message ui-field__message--error checkout-page__error"
        >
          {error}
        </p>
      ) : null}

      <div className="checkout-layout">
        <section className="checkout-section">
          <div className="checkout-section__heading">
            <div>
              <span>1</span>
              <div>
                <h2>Delivery Address</h2>
                <p>Choose where your order should be delivered.</p>
              </div>
            </div>
            {!isAddingAddress && addresses.length ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsAddingAddress(true)}
              >
                Add Address
              </Button>
            ) : null}
          </div>

          {isAddingAddress ? (
            <div className="checkout-address-form">
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={
                  addresses.length ? () => setIsAddingAddress(false) : undefined
                }
                isSubmitting={isSavingAddress}
              />
            </div>
          ) : (
            <div className="checkout-addresses">
              {addresses.map((address) => (
                <label
                  className={`checkout-address${selectedAddressId === address.id ? " checkout-address--selected" : ""}`}
                  key={address.id}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                  <span>
                    <strong>{address.label || address.recipientName}</strong>
                    <small>
                      {address.recipientName} · {address.phone}
                    </small>
                    <small>
                      {address.addressLine1}
                      {address.addressLine2
                        ? `, ${address.addressLine2}`
                        : ""}, {address.city}, {address.country}
                    </small>
                  </span>
                  {address.isDefault ? <em>Default</em> : null}
                </label>
              ))}
            </div>
          )}

          <label className="checkout-notes">
            <span>Delivery notes (optional)</span>
            <textarea
              rows={4}
              maxLength={2000}
              placeholder="Add instructions for your order"
              value={customerNotes}
              onChange={(event) => setCustomerNotes(event.target.value)}
            />
          </label>
        </section>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="checkout-summary__items">
            {items.map((item) => (
              <div key={item.id}>
                <span>
                  <strong>{item.product.name}</strong>
                  <small>Qty {item.quantity}</small>
                </span>
                <strong>
                  {formatAmount(Number(item.unitPrice) * item.quantity)}{" "}
                  {item.product.currency}
                </strong>
              </div>
            ))}
          </div>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>
                {formatAmount(cart?.subtotal ?? 0)} {currency}
              </dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Free</dd>
            </div>
            <div className="checkout-summary__total">
              <dt>Total</dt>
              <dd>
                {formatAmount(cart?.subtotal ?? 0)} {currency}
              </dd>
            </div>
          </dl>
          <Button
            fullWidth
            disabled={!selectedAddressId || isAddingAddress}
            loading={isSubmitting}
            onClick={() => void handlePlaceOrder()}
          >
            Place Order
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={() => navigate("/cart")}
          >
            Back to Cart
          </Button>
        </aside>
      </div>
    </div>
  );
}
