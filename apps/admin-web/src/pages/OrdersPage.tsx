import { useCallback, useEffect, useState } from "react";
import type { BusinessOrderLine } from "@car-platform/api-client";
import {
  Alert,
  Button,
  Card,
  DataTable,
  PageHeader,
  StatusBadge,
} from "@car-platform/ui-web";
import { AdminPageLayout } from "./components/AdminPageLayout";
import { useManagedBusiness } from "./components/useManagedBusiness";
import { ordersApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function OrdersPage() {
  const managed = useManagedBusiness();
  const [items, setItems] = useState<BusinessOrderLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BusinessOrderLine | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems((await ordersApi.listForBusiness({ limit: 100 })).items);
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not load orders."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  async function advance(item: BusinessOrderLine, status: string) {
    setUpdating(item.id);
    try {
      await ordersApi.updateStatus(item.id, status);
      setSuccess(`${item.orderNumber} is now ${status.toLowerCase()}.`);
      await load();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not update the order."));
    } finally {
      setUpdating(null);
    }
  }
  async function processReturn(item: BusinessOrderLine) {
    if (!window.confirm(`Return all items in ${item.orderNumber} to stock?`)) {
      return;
    }
    setUpdating(item.id);
    setError(null);
    setSuccess(null);
    try {
      await ordersApi.processReturn(item.id);
      setSuccess(`${item.orderNumber} was returned and stock was restored.`);
      await load();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not process the return."));
    } finally {
      setUpdating(null);
    }
  }
  function action(item: BusinessOrderLine) {
    const transition =
      item.status === "PENDING"
        ? { label: "Confirm", status: "CONFIRMED" }
        : item.status === "CONFIRMED"
          ? { label: "Prepare", status: "PROCESSING" }
          : item.status === "PROCESSING"
            ? { label: "Ship", status: "SHIPPED" }
            : item.status === "SHIPPED"
              ? { label: "Mark Delivered", status: "DELIVERED" }
              : item.status === "DELIVERED"
                ? { label: "Complete", status: "COMPLETED" }
                : null;
    return (
      <div className="ui-admin-request-card__actions">
        <Button size="xs" variant="outline" onClick={() => setSelected(item)}>
          View
        </Button>
        {transition ? (
          <Button
            size="xs"
            loading={updating === item.id}
            onClick={() => void advance(item, transition.status)}
          >
            {transition.label}
          </Button>
        ) : null}
        {item.status === "DELIVERED" || item.status === "COMPLETED" ? (
          <Button
            size="xs"
            variant="outline"
            loading={updating === item.id}
            onClick={() => void processReturn(item)}
          >
            Return
          </Button>
        ) : null}
      </div>
    );
  }
  const columns = [
    {
      id: "id",
      header: "Order ID",
      cell: (item: BusinessOrderLine) => <strong>{item.orderNumber}</strong>,
    },
    {
      id: "customer",
      header: "Customer",
      cell: (item: BusinessOrderLine) =>
        `${item.customer.user.firstName} ${item.customer.user.lastName}`,
    },
    {
      id: "product",
      header: "Product",
      cell: (item: BusinessOrderLine) => item.products,
    },
    {
      id: "total",
      header: "Total",
      cell: (item: BusinessOrderLine) => `${item.total} ${item.currency}`,
    },
    {
      id: "payment",
      header: "Payment",
      cell: (item: BusinessOrderLine) => (
        <StatusBadge status={item.paymentStatus}>
          {item.paymentStatus === "SUCCEEDED"
            ? "paid"
            : item.paymentStatus.toLowerCase()}
        </StatusBadge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (item: BusinessOrderLine) => (
        <StatusBadge status={item.status}>
          {item.status === "PROCESSING" ? "Preparing" : item.status}
        </StatusBadge>
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: (item: BusinessOrderLine) =>
        new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(item.createdAt)),
    },
    { id: "actions", header: "Actions", cell: action },
  ];
  return (
    <AdminPageLayout
      activeKey="orders"
      business={managed.business}
      title="Orders"
    >
      <PageHeader
        title="Orders"
        subtitle="Customer orders for parts and products"
      />
      {managed.error || error ? (
        <Alert variant="error">{managed.error ?? error}</Alert>
      ) : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
      {selected ? (
        <Card className="ui-admin-service-form">
          <div className="ui-admin-request-card__top">
            <h2>{selected.orderNumber}</h2>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
          </div>
          <p>
            {selected.products} · {selected.total} {selected.currency}
          </p>
          <ul>
            {selected.items.map((item) => (
              <li key={item.id}>
                {item.productName} × {item.quantity}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      <Card padding="none" className="ui-admin-panel">
        {loading ? (
          <p className="ui-admin-page__section">Loading orders…</p>
        ) : (
          <DataTable
            columns={columns}
            data={items}
            getRowKey={(item) => item.id}
            emptyContent="No customer orders found."
          />
        )}
      </Card>
    </AdminPageLayout>
  );
}
