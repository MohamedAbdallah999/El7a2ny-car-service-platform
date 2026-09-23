import { useEffect, useMemo, useState } from "react";
import type {
  BusinessBranchSummary,
  BusinessSummary,
} from "@car-platform/types";
import {
  Alert,
  Button,
  Card,
  FileUpload,
  Input,
  PageHeader,
  Select,
} from "@car-platform/ui-web";
import { AdminPageLayout } from "./components/AdminPageLayout";
import { useManagedBusiness } from "./components/useManagedBusiness";
import { businessesApi, dashboardApi, uploadsApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";
import { fileToBase64, validateImageFile } from "../lib/files";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type EditableHour = {
  dayOfWeek: number;
  openingTime: string;
  closingTime: string;
  isClosed: boolean;
};

type BranchForm = {
  id: string | null;
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isPrimary: boolean;
  status: string;
};

const emptyBranch = (): BranchForm => ({
  id: null,
  name: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "Egypt",
  postalCode: "",
  isPrimary: false,
  status: "ACTIVE",
});

const toBranchForm = (branch: BusinessBranchSummary): BranchForm => ({
  id: branch.id,
  name: branch.name,
  phone: branch.phone ?? "",
  email: branch.email ?? "",
  addressLine1: branch.addressLine1,
  addressLine2: branch.addressLine2 ?? "",
  city: branch.city,
  state: branch.state ?? "",
  country: branch.country ?? "Egypt",
  postalCode: branch.postalCode ?? "",
  isPrimary: branch.isPrimary,
  status: branch.status ?? "ACTIVE",
});

const toHours = (branch?: BusinessBranchSummary): EditableHour[] =>
  days.map((_, dayOfWeek) => {
    const existing = branch?.hours?.find(
      (item) => item.dayOfWeek === dayOfWeek,
    );
    return {
      dayOfWeek,
      openingTime: existing?.openingTime?.slice(11, 16) ?? "09:00",
      closingTime: existing?.closingTime?.slice(11, 16) ?? "17:00",
      isClosed: existing?.isClosed ?? false,
    };
  });

export function MyBusinessPage() {
  const managed = useManagedBusiness();
  const [stats, setStats] = useState({ customers: 0, services: 0 });
  useEffect(() => {
    void dashboardApi
      .getAdminOverview()
      .then((data) =>
        setStats({
          customers: data.stats.totalCustomers,
          services: data.stats.activeServices,
        }),
      )
      .catch(() => undefined);
  }, []);

  return (
    <AdminPageLayout
      activeKey="business"
      business={managed.business}
      title="My Business"
    >
      <PageHeader
        title="My Business"
        subtitle="Manage your shop, image, branches, and opening hours"
        action={
          <Button
            type="submit"
            form="business-profile-form"
            size="sm"
            disabled={!managed.business || managed.isLoading}
          >
            Save Changes
          </Button>
        }
      />
      {managed.error ? <Alert variant="error">{managed.error}</Alert> : null}
      {managed.isLoading ? (
        <Card>Loading business information…</Card>
      ) : !managed.business ? (
        <Card>No business is connected to this admin account.</Card>
      ) : (
        <BusinessForm
          business={managed.business}
          setBusiness={managed.setBusiness}
          stats={stats}
        />
      )}
    </AdminPageLayout>
  );
}

function BusinessForm({
  business,
  setBusiness,
  stats,
}: {
  business: BusinessSummary;
  setBusiness: (business: BusinessSummary) => void;
  stats: { customers: number; services: number };
}) {
  const initialBranch =
    business.branches?.find((item) => item.isPrimary) ?? business.branches?.[0];
  const [form, setForm] = useState({
    name: business.name,
    businessType: business.businessType,
    description: business.description ?? "",
    phone: business.phone ?? "",
    email: business.email ?? "",
  });
  const [branchForm, setBranchForm] = useState<BranchForm>(
    initialBranch ? toBranchForm(initialBranch) : emptyBranch(),
  );
  const [hours, setHours] = useState<EditableHour[]>(() =>
    toHours(initialBranch),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const imagePreview = useMemo(
    () =>
      imageFile
        ? URL.createObjectURL(imageFile)
        : (business.coverImageUrl ?? null),
    [business.coverImageUrl, imageFile],
  );
  useEffect(
    () => () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  function selectBranch(branchId: string) {
    const branch = business.branches?.find((item) => item.id === branchId);
    if (!branch) return;
    setBranchForm(toBranchForm(branch));
    setHours(toHours(branch));
    setError(null);
    setSuccess(null);
  }

  function setHour(index: number, changes: Partial<EditableHour>) {
    setHours((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item,
      ),
    );
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      let coverImageUrl = business.coverImageUrl;
      if (imageFile) {
        const uploaded = await uploadsApi.upload({
          fileName: imageFile.name,
          mimeType: imageFile.type as "image/png" | "image/jpeg",
          data: await fileToBase64(imageFile),
          purpose: "BUSINESS_IMAGE",
        });
        coverImageUrl = uploaded.fileUrl;
      }

      await businessesApi.update(business.id, {
        ...form,
        description: form.description || null,
        phone: form.phone || null,
        email: form.email || null,
        coverImageUrl,
      });

      const branchPayload = {
        name: branchForm.name,
        phone: branchForm.phone || undefined,
        email: branchForm.email || undefined,
        addressLine1: branchForm.addressLine1,
        addressLine2: branchForm.addressLine2 || undefined,
        city: branchForm.city,
        state: branchForm.state || undefined,
        country: branchForm.country,
        postalCode: branchForm.postalCode || undefined,
        isPrimary: branchForm.isPrimary,
      };

      let savedBranch = branchForm.id
        ? (
            await businessesApi.updateBranch(business.id, branchForm.id, {
              ...branchPayload,
              status: branchForm.status,
            })
          ).branch
        : (await businessesApi.createBranch(business.id, branchPayload)).branch;

      if (!branchForm.id && branchForm.status !== "ACTIVE") {
        savedBranch = (
          await businessesApi.updateBranch(business.id, savedBranch.id, {
            status: branchForm.status,
          })
        ).branch;
      }

      await businessesApi.setBranchHours(business.id, savedBranch.id, {
        hours,
      });

      const { business: updated } = await businessesApi.getById(business.id);
      setBusiness(updated);
      setImageFile(null);
      const refreshedBranch = updated.branches?.find(
        (item) => item.id === savedBranch.id,
      );
      if (refreshedBranch) {
        setBranchForm(toBranchForm(refreshedBranch));
        setHours(toHours(refreshedBranch));
      }
      setSuccess(
        branchForm.id
          ? "Business and branch changes were saved successfully."
          : "The new branch was added successfully.",
      );
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not save business information."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id="business-profile-form" onSubmit={save}>
      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
      <div className="ui-admin-business-grid">
        <div className="ui-admin-business-grid__main">
          <Card className="ui-admin-page__card">
            <h2>Business Information</h2>
            <div className="ui-admin-form-grid">
              <div className="ui-field ui-field--wide">
                {imagePreview ? (
                  <img
                    className="ui-admin-image-preview ui-admin-image-preview--business"
                    src={imagePreview}
                    alt={`${business.name} preview`}
                  />
                ) : null}
                <FileUpload
                  accept="image/png,image/jpeg"
                  label="Business photo"
                  description={imageFile?.name ?? "PNG or JPG · Max 5 MB"}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (!file) return;
                    const validationError = validateImageFile(file);
                    if (validationError) {
                      setError(validationError);
                      return;
                    }
                    setError(null);
                    setImageFile(file);
                  }}
                  onRemove={imageFile ? () => setImageFile(null) : undefined}
                />
              </div>
              <Input
                label="Shop Name"
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
              <Select
                label="Business Type"
                value={form.businessType}
                onChange={(event) =>
                  setForm({
                    ...form,
                    businessType: event.target
                      .value as BusinessSummary["businessType"],
                  })
                }
              >
                <option value="GARAGE">General Auto Service</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="SERVICE_CENTER">Service Center</option>
                <option value="MULTI_SERVICE">Multi-service</option>
              </Select>
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
              <Input
                label="Phone"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </div>
          </Card>

          <Card className="ui-admin-page__card">
            <div className="ui-admin-request-card__top">
              <h2>Branches and Address</h2>
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  setBranchForm(emptyBranch());
                  setHours(toHours());
                  setSuccess(null);
                }}
              >
                + Add Branch
              </Button>
            </div>
            {business.branches?.length ? (
              <Select
                label="Select branch"
                value={branchForm.id ?? ""}
                onChange={(event) => selectBranch(event.target.value)}
              >
                <option value="" disabled>
                  New branch
                </option>
                {business.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                    {branch.isPrimary ? " (Primary)" : ""}
                  </option>
                ))}
              </Select>
            ) : null}
            <div className="ui-admin-form-grid ui-admin-branch-fields">
              <Input
                label="Branch name"
                required
                value={branchForm.name}
                onChange={(event) =>
                  setBranchForm({ ...branchForm, name: event.target.value })
                }
              />
              <Input
                label="Address line 1"
                required
                value={branchForm.addressLine1}
                onChange={(event) =>
                  setBranchForm({
                    ...branchForm,
                    addressLine1: event.target.value,
                  })
                }
              />
              <Input
                label="Address line 2"
                value={branchForm.addressLine2}
                onChange={(event) =>
                  setBranchForm({
                    ...branchForm,
                    addressLine2: event.target.value,
                  })
                }
              />
              <Input
                label="City"
                required
                value={branchForm.city}
                onChange={(event) =>
                  setBranchForm({ ...branchForm, city: event.target.value })
                }
              />
              <Input
                label="State / Governorate"
                value={branchForm.state}
                onChange={(event) =>
                  setBranchForm({ ...branchForm, state: event.target.value })
                }
              />
              <Input
                label="Country"
                required
                value={branchForm.country}
                onChange={(event) =>
                  setBranchForm({ ...branchForm, country: event.target.value })
                }
              />
              <Input
                label="Postal code"
                value={branchForm.postalCode}
                onChange={(event) =>
                  setBranchForm({
                    ...branchForm,
                    postalCode: event.target.value,
                  })
                }
              />
              <label className="ui-admin-status-control">
                <input
                  type="checkbox"
                  checked={branchForm.isPrimary}
                  onChange={(event) =>
                    setBranchForm({
                      ...branchForm,
                      isPrimary: event.target.checked,
                    })
                  }
                />
                Primary branch
              </label>
            </div>
          </Card>

          <Card className="ui-admin-page__card">
            <h2>Opening Hours</h2>
            <div className="ui-admin-request-list">
              {hours.map((hour, index) => (
                <div className="ui-admin-hours-row" key={hour.dayOfWeek}>
                  <strong>{days[hour.dayOfWeek]}</strong>
                  <Input
                    aria-label={`${days[hour.dayOfWeek]} opening time`}
                    type="time"
                    disabled={hour.isClosed}
                    value={hour.openingTime}
                    onChange={(event) =>
                      setHour(index, { openingTime: event.target.value })
                    }
                  />
                  <span>to</span>
                  <Input
                    aria-label={`${days[hour.dayOfWeek]} closing time`}
                    type="time"
                    disabled={hour.isClosed}
                    value={hour.closingTime}
                    onChange={(event) =>
                      setHour(index, { closingTime: event.target.value })
                    }
                  />
                  <label className="ui-admin-status-control">
                    <input
                      type="checkbox"
                      checked={hour.isClosed}
                      onChange={(event) =>
                        setHour(index, { isClosed: event.target.checked })
                      }
                    />
                    Closed
                  </label>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="ui-admin-business-grid__aside">
          <Card>
            <h2>Branch Status</h2>
            <div className="ui-admin-business-statuses">
              <label
                className={
                  branchForm.status === "ACTIVE" ? "is-selected" : undefined
                }
              >
                <input
                  type="radio"
                  name="branch-status"
                  checked={branchForm.status === "ACTIVE"}
                  onChange={() =>
                    setBranchForm({ ...branchForm, status: "ACTIVE" })
                  }
                />
                <span>
                  <strong>Open</strong>
                  <small>Accepting bookings</small>
                </span>
              </label>
              <label
                className={
                  branchForm.status === "CLOSED" ? "is-selected" : undefined
                }
              >
                <input
                  type="radio"
                  name="branch-status"
                  checked={branchForm.status === "CLOSED"}
                  onChange={() =>
                    setBranchForm({ ...branchForm, status: "CLOSED" })
                  }
                />
                <span>
                  <strong>Closed</strong>
                  <small>Not accepting bookings</small>
                </span>
              </label>
            </div>
          </Card>
          <Card>
            <h2>Quick Stats</h2>
            <dl className="ui-admin-quick-stats">
              <div>
                <dt>Overall Rating</dt>
                <dd>{business.averageRating} ★</dd>
              </div>
              <div>
                <dt>Total Reviews</dt>
                <dd>{business.totalReviews}</dd>
              </div>
              <div>
                <dt>Total Customers</dt>
                <dd>{stats.customers}</dd>
              </div>
              <div>
                <dt>Services Offered</dt>
                <dd>{stats.services}</dd>
              </div>
              <div>
                <dt>Branches</dt>
                <dd>{business.branches?.length ?? 0}</dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>
      <span className="ui-admin-save-state" aria-live="polite">
        {saving ? "Saving changes…" : ""}
      </span>
    </form>
  );
}
