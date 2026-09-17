import type { CustomerAddress } from "@car-platform/types";
import { Button, Card, EmptyState, PageHeader, SuccessState } from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddressForm } from "../components/AddressForm";
import { addressesApi, ordersApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function CheckoutPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    addressesApi
      .list()
      .then(({ addresses: list }) => {
        setAddresses(list);
        setSelectedAddressId(
          (prev) => prev ?? list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null,
        );
      })
      .catch((err) => setError(getErrorMessage(err, "Could not load your addresses.")))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleAddAddress(payload: Parameters<typeof addressesApi.create>[0]) {
    const { address } = await addressesApi.create(payload);
    setAddresses((prev) => [...prev, address]);
    setSelectedAddressId(address.id);
    setIsAddingAddress(false);
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const { order } = await ordersApi.checkout({
        shippingAddressId: selectedAddressId,
      });
      setOrderNumber(order.orderNumber);
    } catch (err) {
      setError(getErrorMessage(err, "Could not place this order."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (orderNumber) {
    return (
      <SuccessState
        title="Order placed"
        description={`Your order ${orderNumber} has been placed.`}
        actions={<Button onClick={() => navigate("/orders")}>View my orders</Button>}
      />
    );
  }

  return (
    <div className="center-column form-stack">
      <PageHeader title="Checkout" subtitle="Choose a delivery address" />

      {error ? (
        <p role="alert" className="ui-field__message ui-field__message--error">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="loading-block">Loading…</p>
      ) : isAddingAddress ? (
        <AddressForm
          onSubmit={handleAddAddress}
          onCancel={() => setIsAddingAddress(false)}
        />
      ) : (
        <>
          {addresses.length === 0 ? (
            <EmptyState title="No saved addresses" description="Add an address to continue." />
          ) : (
            <div className="form-stack">
              {addresses.map((address) => (
                <label key={address.id} className="spread-row" style={{ cursor: "pointer" }}>
                  <span>
                    <strong>{address.recipientName}</strong>
                    <br />
                    <span className="muted-text">
                      {address.addressLine1}, {address.city}
                    </span>
                  </span>
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                </label>
              ))}
            </div>
          )}

          <Button variant="secondary" onClick={() => setIsAddingAddress(true)}>
            Add a new address
          </Button>

          <Card className="spread-row">
            <strong>Total</strong>
            <span className="muted-text">Calculated at order creation</span>
          </Card>

          <Button
            fullWidth
            disabled={!selectedAddressId}
            loading={isSubmitting}
            onClick={handlePlaceOrder}
          >
            Place order
          </Button>
        </>
      )}
    </div>
  );
}
