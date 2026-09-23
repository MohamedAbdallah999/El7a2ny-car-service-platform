import { useCallback, useEffect, useState } from "react";
import type { InventoryItem } from "@car-platform/api-client";
import {
  Alert,
  Button,
  Card,
  DataTable,
  Input,
  PageHeader,
  Select,
  StatusBadge,
} from "@car-platform/ui-web";
import { AdminPageLayout } from "./components/AdminPageLayout";
import { useManagedBusiness } from "./components/useManagedBusiness";
import { catalogApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function InventoryPage() {
  const managed = useManagedBusiness();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [adjustment, setAdjustment] = useState({
    type: "ADJUSTMENT",
    quantity: "",
    notes: "",
  });
  const load = useCallback(async () => {
    if (!managed.business) return;
    setLoading(true);
    try {
      setItems((await catalogApi.listInventory(managed.business.id)).items);
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not load inventory."));
    } finally {
      setLoading(false);
    }
  }, [managed.business]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  async function adjust(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await catalogApi.adjustInventory(selected.id, {
        type: adjustment.type,
        quantity: Number(adjustment.quantity),
        notes: adjustment.notes || undefined,
      });
      setSelected(null);
      setAdjustment({ type: "ADJUSTMENT", quantity: "", notes: "" });
      setSuccess("Stock was updated successfully.");
      await load();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not adjust stock."));
    } finally {
      setSaving(false);
    }
  }
  const columns = [
    {
      id: "sku",
      header: "SKU",
      cell: (item: InventoryItem) => (
        <span className="ui-admin-sku">{item.product.sku}</span>
      ),
    },
    {
      id: "product",
      header: "Product",
      cell: (item: InventoryItem) => <strong>{item.product.name}</strong>,
    },
    {
      id: "category",
      header: "Category",
      cell: (item: InventoryItem) => item.product.category?.name ?? "—",
    },
    {
      id: "stock",
      header: "Stock",
      cell: (item: InventoryItem) => (
        <strong
          className={
            item.availableQuantity === 0
              ? "ui-admin-stock-number ui-admin-stock-number--empty"
              : item.availableQuantity <= item.lowStockThreshold
                ? "ui-admin-stock-number ui-admin-stock-number--low"
                : "ui-admin-stock-number ui-admin-stock-number--good"
          }
        >
          {item.availableQuantity}
        </strong>
      ),
    },
    {
      id: "minimum",
      header: "Min. Stock",
      cell: (item: InventoryItem) => item.lowStockThreshold,
    },
    {
      id: "status",
      header: "Status",
      cell: (item: InventoryItem) => (
        <StatusBadge
          status={
            item.availableQuantity === 0
              ? "Out of Stock"
              : item.availableQuantity <= item.lowStockThreshold
                ? "Low Stock"
                : "In Stock"
          }
        />
      ),
    },
    {
      id: "cost",
      header: "Cost",
      cell: (item: InventoryItem) =>
        item.product.costPrice
          ? `${item.product.costPrice} ${item.product.currency}`
          : "—",
    },
    {
      id: "price",
      header: "Sale Price",
      cell: (item: InventoryItem) =>
        `${item.product.price} ${item.product.currency}`,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (item: InventoryItem) => (
        <Button size="xs" variant="outline" onClick={() => setSelected(item)}>
          Adjust
        </Button>
      ),
    },
  ];
  const inStockCount = items.filter(
    (item) => item.availableQuantity > item.lowStockThreshold,
  ).length;
  const lowStockCount = items.filter(
    (item) =>
      item.availableQuantity > 0 &&
      item.availableQuantity <= item.lowStockThreshold,
  ).length;
  const outOfStockCount = items.filter(
    (item) => item.availableQuantity === 0,
  ).length;
  return (
    <AdminPageLayout
      activeKey="inventory"
      business={managed.business}
      title="Inventory"
    >
      <PageHeader
        title="Inventory"
        subtitle="Track and manage your parts and product stock"
        action={
          <Button
            size="sm"
            variant="outline"
            disabled={!items.length}
            onClick={() => setSelected(items[0] ?? null)}
          >
            Adjust Stock
          </Button>
        }
      />
      {managed.error || error ? (
        <Alert variant="error">{managed.error ?? error}</Alert>
      ) : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
      <div className="ui-admin-inventory-stats" aria-label="Stock summary">
        <Card className="ui-admin-inventory-stat ui-admin-inventory-stat--good">
          <strong>{inStockCount}</strong>
          <span>In Stock</span>
        </Card>
        <Card className="ui-admin-inventory-stat ui-admin-inventory-stat--low">
          <strong>{lowStockCount}</strong>
          <span>Low Stock</span>
        </Card>
        <Card className="ui-admin-inventory-stat ui-admin-inventory-stat--empty">
          <strong>{outOfStockCount}</strong>
          <span>Out of Stock</span>
        </Card>
      </div>
      {selected ? (
        <Card className="ui-admin-service-form">
          <form onSubmit={adjust}>
            <h2>Adjust {selected.product.name}</h2>
            <div className="ui-admin-form-grid">
              <Select
                label="Adjustment type"
                value={adjustment.type}
                onChange={(event) =>
                  setAdjustment({ ...adjustment, type: event.target.value })
                }
              >
                <option value="ADJUSTMENT">Adjustment</option>
                <option value="PURCHASE">Purchase</option>
                <option value="RETURN">Return</option>
                <option value="DAMAGE">Damage</option>
              </Select>
              <Input
                label={
                  adjustment.type === "DAMAGE"
                    ? "Damaged quantity"
                    : adjustment.type === "ADJUSTMENT"
                      ? "Quantity change (+ or -)"
                      : "Quantity received"
                }
                type="number"
                required
                min={adjustment.type === "ADJUSTMENT" ? undefined : "1"}
                value={adjustment.quantity}
                onChange={(event) =>
                  setAdjustment({ ...adjustment, quantity: event.target.value })
                }
              />
              <Input
                label="Notes"
                value={adjustment.notes}
                onChange={(event) =>
                  setAdjustment({ ...adjustment, notes: event.target.value })
                }
              />
            </div>
            <div className="ui-admin-page__actions">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save Adjustment
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      <Card padding="none" className="ui-admin-panel">
        {loading ? (
          <p className="ui-admin-page__section">Loading inventory…</p>
        ) : (
          <DataTable
            columns={columns}
            data={items}
            getRowKey={(item) => item.id}
            emptyContent="No inventory records found."
          />
        )}
      </Card>
    </AdminPageLayout>
  );
}
