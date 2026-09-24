import { useCallback, useEffect, useState } from "react";
import type { ServiceRequestSummary } from "@car-platform/types";
import {
  Alert,
  Button,
  Card,
  Input,
  PageHeader,
  Select,
  StatusBadge,
} from "@car-platform/ui-web";
import { AdminPageLayout } from "./components/AdminPageLayout";
import { useManagedBusiness } from "./components/useManagedBusiness";
import { serviceRequestsApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

const customerName = (request: ServiceRequestSummary) =>
  request.customer?.user
    ? `${request.customer.user.firstName} ${request.customer.user.lastName}`
    : "Customer";

const vehicleName = (request: ServiceRequestSummary) =>
  request.vehicle
    ? `${request.vehicle.make?.name ?? ""} ${request.vehicle.model?.name ?? ""} ${request.vehicle.year}`.trim()
    : "Vehicle not provided";

export function ServiceRequestsPage() {
  const managed = useManagedBusiness();
  const [requests, setRequests] = useState<ServiceRequestSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editing, setEditing] = useState<ServiceRequestSummary | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await serviceRequestsApi.listForBusiness({
        limit: 100,
        status: "PENDING",
      });
      setRequests(result.items);
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not load service requests."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function accept(request: ServiceRequestSummary) {
    setUpdating(request.id);
    setError(null);
    setSuccess(null);
    try {
      await serviceRequestsApi.accept(request.id);
      setSuccess(
        `${request.requestNumber} was accepted and is now available in Bookings.`,
      );
      await load();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not accept the request."));
    } finally {
      setUpdating(null);
    }
  }

  async function reject(request: ServiceRequestSummary) {
    setUpdating(request.id);
    setError(null);
    setSuccess(null);
    try {
      await serviceRequestsApi.updateStatus(request.id, "REJECTED");
      setSuccess(`${request.requestNumber} was rejected.`);
      await load();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not reject the request."));
    } finally {
      setUpdating(null);
    }
  }

  function openEdit(request: ServiceRequestSummary) {
    setEditing(request);
    setEditForm({
      title: request.title,
      description: request.description ?? "",
      priority: request.priority,
    });
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setUpdating(editing.id);
    setError(null);
    setSuccess(null);
    try {
      await serviceRequestsApi.update(editing.id, {
        title: editForm.title,
        description: editForm.description || null,
        priority: editForm.priority,
      });
      setSuccess(`${editing.requestNumber} was updated.`);
      setEditing(null);
      await load();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not update the request."));
    } finally {
      setUpdating(null);
    }
  }

  return (
    <AdminPageLayout
      activeKey="requests"
      business={managed.business}
      title="Service Requests"
    >
      <PageHeader
        title="Service Requests"
        subtitle="Pending customer booking and service requests"
      />
      {managed.error || error ? (
        <Alert variant="error">{managed.error ?? error}</Alert>
      ) : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
      {editing ? (
        <Card className="ui-admin-service-form">
          <form onSubmit={saveEdit}>
            <h2>Edit {editing.requestNumber}</h2>
            <div className="ui-admin-form-grid">
              <Input
                label="Title"
                required
                value={editForm.title}
                onChange={(event) =>
                  setEditForm({ ...editForm, title: event.target.value })
                }
              />
              <Select
                label="Priority"
                value={editForm.priority}
                onChange={(event) =>
                  setEditForm({ ...editForm, priority: event.target.value })
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
              <label className="ui-field ui-field--wide">
                <span className="ui-field__label">Description</span>
                <textarea
                  className="ui-admin-textarea"
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      description: event.target.value,
                    })
                  }
                />
              </label>
            </div>
            <div className="ui-admin-page__actions">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={updating === editing.id}>
                Save Request
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      {loading ? (
        <Card>Loading service requests…</Card>
      ) : requests.length ? (
        <div className="ui-admin-request-list">
          {requests.map((request) => (
            <Card
              as="article"
              className="ui-admin-request-card"
              key={request.id}
            >
              <div className="ui-admin-request-card__top">
                <strong>{request.requestNumber}</strong>
                <span>
                  <StatusBadge status={request.priority} />{" "}
                  <StatusBadge status={request.status} />
                </span>
              </div>
              <h2>{request.title}</h2>
              <div className="ui-admin-request-card__meta">
                <span>
                  {customerName(request)} · {vehicleName(request)}
                </span>
                <time>
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(request.createdAt))}
                </time>
              </div>
              {request.description ? <p>{request.description}</p> : null}
              {request.booking ? (
                <p>
                  Requested for {request.booking.scheduledDate.slice(0, 10)} at{" "}
                  {request.booking.startTime.slice(11, 16)}
                </p>
              ) : null}
              <div className="ui-admin-request-card__actions">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => openEdit(request)}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  loading={updating === request.id}
                  onClick={() => void reject(request)}
                >
                  Reject
                </Button>
                <Button
                  size="xs"
                  loading={updating === request.id}
                  disabled={!request.booking}
                  onClick={() => void accept(request)}
                >
                  Accept
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>No pending service requests.</Card>
      )}
    </AdminPageLayout>
  );
}
