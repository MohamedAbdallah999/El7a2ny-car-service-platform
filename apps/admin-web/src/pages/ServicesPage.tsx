import { useCallback, useEffect, useState } from "react";
import type { ServiceCategory, ServiceSummary } from "@car-platform/types";
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
import { servicesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

type ServiceForm = {
  name: string;
  categoryId: string;
  basePrice: string;
  durationMinutes: string;
  description: string;
};
const blankForm: ServiceForm = {
  name: "",
  categoryId: "",
  basePrice: "",
  durationMinutes: "60",
  description: "",
};
const money = (value: string, currency: string) =>
  Number(value) === 0
    ? "Free"
    : `${Number(value).toLocaleString("en-EG", { maximumFractionDigits: 2 })} ${currency}`;

export function ServicesPage() {
  const managed = useManagedBusiness();
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [form, setForm] = useState<ServiceForm>(blankForm);
  const [editing, setEditing] = useState<ServiceSummary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [serviceResult, categoryResult] = await Promise.all([
        servicesApi.listForBusiness({ limit: 100 }),
        servicesApi.listCategories(),
      ]);
      setServices(serviceResult.items);
      setCategories(categoryResult.categories);
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not load services."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  function edit(service: ServiceSummary) {
    setEditing(service);
    setForm({
      name: service.name,
      categoryId: service.categoryId,
      basePrice: service.basePrice,
      durationMinutes: String(service.durationMinutes),
      description: service.description ?? "",
    });
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(blankForm);
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!managed.business) return;
    setSaving(true);
    setError(null);
    try {
      const data = {
        name: form.name,
        categoryId: form.categoryId,
        basePrice: Number(form.basePrice),
        durationMinutes: Number(form.durationMinutes),
        description: form.description || undefined,
      };
      if (editing) await servicesApi.update(editing.id, data);
      else
        await servicesApi.create({ businessId: managed.business.id, ...data });
      closeForm();
      await load();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not save the service."));
    } finally {
      setSaving(false);
    }
  }
  async function toggle(service: ServiceSummary) {
    try {
      await servicesApi.update(service.id, { isActive: !service.isActive });
      await load();
    } catch (caught) {
      setError(
        getErrorMessage(caught, "Could not update service availability."),
      );
    }
  }
  const columns = [
    {
      id: "name",
      header: "Service",
      cell: (item: ServiceSummary) => <strong>{item.name}</strong>,
    },
    {
      id: "category",
      header: "Category",
      cell: (item: ServiceSummary) => (
        <StatusBadge status={item.category?.name ?? "Uncategorized"} />
      ),
    },
    {
      id: "price",
      header: "Price",
      cell: (item: ServiceSummary) => money(item.basePrice, item.currency),
    },
    {
      id: "duration",
      header: "Duration",
      cell: (item: ServiceSummary) =>
        item.durationMinutes >= 60
          ? `${item.durationMinutes / 60} hr${item.durationMinutes === 60 ? "" : "s"}`
          : `${item.durationMinutes} min`,
    },
    { id: "availability", header: "Availability", cell: () => "All vehicles" },
    {
      id: "status",
      header: "Status",
      cell: (item: ServiceSummary) => (
        <StatusBadge status={item.isActive ? "Active" : "Inactive"} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (item: ServiceSummary) => (
        <div className="ui-admin-request-card__actions">
          <Button variant="outline" size="xs" onClick={() => edit(item)}>
            Edit
          </Button>
          <Button variant="outline" size="xs" onClick={() => void toggle(item)}>
            {item.isActive ? "Disable" : "Enable"}
          </Button>
        </div>
      ),
    },
  ];
  return (
    <AdminPageLayout
      activeKey="services"
      business={managed.business}
      title="Services"
    >
      <PageHeader
        title="Services"
        subtitle="Manage the services your shop offers"
        action={
          <Button
            size="sm"
            disabled={!managed.business}
            onClick={() => setShowForm(true)}
          >
            + Add Service
          </Button>
        }
      />
      {managed.error || error ? (
        <Alert variant="error">{managed.error ?? error}</Alert>
      ) : null}
      {showForm ? (
        <Card className="ui-admin-service-form">
          <form onSubmit={save}>
            <h2>{editing ? "Edit Service" : "Add Service"}</h2>
            <div className="ui-admin-form-grid">
              <Input
                label="Service name"
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
              <Select
                label="Category"
                required
                value={form.categoryId}
                onChange={(event) =>
                  setForm({ ...form, categoryId: event.target.value })
                }
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Price (EGP)"
                required
                min="0"
                type="number"
                value={form.basePrice}
                onChange={(event) =>
                  setForm({ ...form, basePrice: event.target.value })
                }
              />
              <Input
                label="Duration (minutes)"
                required
                min="1"
                type="number"
                value={form.durationMinutes}
                onChange={(event) =>
                  setForm({ ...form, durationMinutes: event.target.value })
                }
              />
              <label className="ui-field ui-field--wide">
                <span className="ui-field__label">Description</span>
                <textarea
                  className="ui-admin-textarea"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>
            </div>
            <div className="ui-admin-page__actions">
              <Button variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save Service
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      <Card padding="none" className="ui-admin-panel">
        {loading ? (
          <p className="ui-admin-page__section">Loading services…</p>
        ) : (
          <DataTable
            columns={columns}
            data={services}
            getRowKey={(item) => item.id}
            emptyContent="No services have been added yet."
          />
        )}
      </Card>
    </AdminPageLayout>
  );
}
