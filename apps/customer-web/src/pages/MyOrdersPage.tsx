import type { Order } from "@car-platform/types";
import { Button, EmptyState } from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { cartApi, ordersApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

type ExpandedOrder = {
  id: string;
  view: "tracking" | "invoice";
};

type OrderItemWithBusiness = Order["items"][number] & {
  business?: { name: string };
};

function getStatusPresentation(status: Order["status"]) {
  if (status === "DELIVERED" || status === "COMPLETED") {
    return { label: "Delivered", tone: "delivered" };
  }
  if (status === "SHIPPED") {
    return { label: "Shipped", tone: "shipped" };
  }
  if (status === "CANCELLED") {
    return { label: "Cancelled", tone: "cancelled" };
  }
  if (status === "REFUNDED" || status === "PARTIALLY_REFUNDED") {
    return { label: "Refunded", tone: "refunded" };
  }
  return { label: "Preparing", tone: "preparing" };
}

function formatAmount(amount: string) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<ExpandedOrder | null>(
    null,
  );
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    ordersApi
      .listMine({ limit: 40 })
      .then((result) => setOrders(result.items))
      .catch((reason: unknown) =>
        setError(getErrorMessage(reason, "Could not load your orders.")),
      )
      .finally(() => setIsLoading(false));
  }, []);

  function toggleOrderView(id: string, view: ExpandedOrder["view"]) {
    setExpandedOrder((current) =>
      current?.id === id && current.view === view ? null : { id, view },
    );
  }

  async function handleReorder(order: Order) {
    setReorderingId(order.id);
    setError(null);
    setNotice(null);
    try {
      for (const item of order.items) {
        await cartApi.addItem(item.productId, item.quantity);
      }
      window.dispatchEvent(new Event("cart-updated"));
      setNotice(`Items from ${order.orderNumber} were added to your cart.`);
    } catch (reason) {
      setError(
        getErrorMessage(reason, "Could not add these items to your cart."),
      );
    } finally {
      setReorderingId(null);
    }
  }

  return (
    <div className="customer-page orders-page">
      <header className="customer-page__heading">
        <h1>My Orders</h1>
      </header>

      {notice ? (
        <p role="status" className="orders-page__notice">
          {notice}
        </p>
      ) : null}
      {error && !isLoading ? (
        <p role="alert" className="ui-field__message ui-field__message--error">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="loading-block">Loading…</p>
      ) : error && orders.length === 0 ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" />
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const status = getStatusPresentation(order.status);
            const isExpanded = expandedOrder?.id === order.id;
            const shopNames = [
              ...new Set(
                order.items
                  .map((item) => (item as OrderItemWithBusiness).business?.name)
                  .filter((name): name is string => Boolean(name)),
              ),
            ];

            return (
              <article className="order-card" key={order.id}>
                <div className="order-card__summary">
                  <div className="order-card__content">
                    <div className="order-card__reference">
                      <span>{order.orderNumber}</span>
                      <span
                        className={`order-status order-status--${status.tone}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <h2>
                      {order.items
                        .map((item) => item.productNameSnapshot)
                        .join(", ")}
                    </h2>
                    <p>
                      {shopNames.length > 0 ? shopNames.join(", ") : "Shop"} ·
                      Ordered {formatOrderDate(order.createdAt)}
                    </p>
                  </div>
                  <strong className="order-card__total">
                    {formatAmount(order.totalAmount)} {order.currency}
                  </strong>
                </div>

                <div className="order-card__actions">
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-expanded={
                      isExpanded && expandedOrder?.view === "tracking"
                    }
                    onClick={() => toggleOrderView(order.id, "tracking")}
                  >
                    Track Order
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-expanded={
                      isExpanded && expandedOrder?.view === "invoice"
                    }
                    onClick={() => toggleOrderView(order.id, "invoice")}
                  >
                    Invoice
                  </Button>
                  {status.tone === "delivered" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={reorderingId === order.id}
                      onClick={() => void handleReorder(order)}
                    >
                      Reorder
                    </Button>
                  ) : null}
                </div>

                {isExpanded && expandedOrder?.view === "tracking" ? (
                  <div className="order-card__panel" role="region">
                    <span>Current status</span>
                    <strong>{status.label}</strong>
                    <p>
                      This status is updated from your order’s live fulfillment
                      record.
                    </p>
                  </div>
                ) : null}

                {isExpanded && expandedOrder?.view === "invoice" ? (
                  <div
                    className="order-card__panel order-card__invoice"
                    role="region"
                  >
                    <dl>
                      <div>
                        <dt>Subtotal</dt>
                        <dd>
                          {formatAmount(order.subtotal)} {order.currency}
                        </dd>
                      </div>
                      <div>
                        <dt>Discount</dt>
                        <dd>
                          −{formatAmount(order.discountAmount)} {order.currency}
                        </dd>
                      </div>
                      <div>
                        <dt>Shipping</dt>
                        <dd>
                          {formatAmount(order.shippingAmount)} {order.currency}
                        </dd>
                      </div>
                      <div>
                        <dt>Tax</dt>
                        <dd>
                          {formatAmount(order.taxAmount)} {order.currency}
                        </dd>
                      </div>
                      <div className="order-card__invoice-total">
                        <dt>Total</dt>
                        <dd>
                          {formatAmount(order.totalAmount)} {order.currency}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
