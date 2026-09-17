import type { Order } from "@car-platform/types";
import { Card, EmptyState, PageHeader, StatusBadge } from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { ordersApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ordersApi
      .listMine({ limit: 40 })
      .then((result) => setOrders(result.items))
      .catch((err) => setError(getErrorMessage(err, "Could not load your orders.")))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="form-stack" style={{ gap: "1.5rem" }}>
      <PageHeader title="My Orders" />

      {isLoading ? (
        <p className="loading-block">Loading…</p>
      ) : error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" />
      ) : (
        <div className="form-stack">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="spread-row">
                <div>
                  <strong>{order.orderNumber}</strong>
                  <p className="muted-text">
                    {order.items.length} item(s) · {order.totalAmount}{" "}
                    {order.currency}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.productNameSnapshot}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
