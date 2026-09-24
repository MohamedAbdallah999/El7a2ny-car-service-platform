import { useCallback, useEffect, useState } from "react";
import type {
  AdminCustomerSummary,
  Booking,
  ServiceSummary,
} from "@car-platform/types";
import {
  Alert,
  Button,
  Card,
  DataTable,
  PageHeader,
  Input,
  Select,
  StatusBadge,
  Tabs,
} from "@car-platform/ui-web";
import { AdminPageLayout } from "./components/AdminPageLayout";
import { useManagedBusiness } from "./components/useManagedBusiness";
import { bookingsApi, dashboardApi, servicesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";
import { useSearchParams } from "react-router-dom";

const formatMoney = (value: string, currency: string) =>
  `${Number(value).toLocaleString("en-EG", { maximumFractionDigits: 2 })} ${currency}`;
const vehicleName = (booking: Booking) =>
  booking.vehicle
    ? `${booking.vehicle.make?.name ?? ""} ${booking.vehicle.model?.name ?? ""} ${booking.vehicle.year}`.trim()
    : "—";
const customerName = (booking: Booking) =>
  booking.customer?.user
    ? `${booking.customer.user.firstName} ${booking.customer.user.lastName}`
    : "Customer";

export function BookingsPage() {
  const managed = useManagedBusiness();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("all");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [showNew, setShowNew] = useState(searchParams.get("new") === "1");
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [form, setForm] = useState({
    customerId: searchParams.get("customerId") ?? "",
    vehicleId: searchParams.get("vehicleId") ?? "",
    serviceId: searchParams.get("serviceId") ?? "",
    scheduledDate: "",
    startTime: "09:00",
  });
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await bookingsApi.listForBusiness({
        limit: 100,
        ...(date ? { date } : {}),
        ...(filter === "all"
          ? {}
          : {
              status:
                filter === "upcoming"
                  ? "CONFIRMED"
                  : filter === "active"
                    ? "IN_PROGRESS"
                    : "COMPLETED",
            }),
      });
      setBookings(result.items);
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not load bookings."));
    } finally {
      setLoading(false);
    }
  }, [date, filter]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  useEffect(() => {
    if (!showNew) return;
    void Promise.all([
      dashboardApi.listAdminCustomers(),
      servicesApi.listForBusiness({ limit: 100 }),
    ])
      .then(([customerData, serviceData]) => {
        setCustomers(customerData.customers);
        setServices(serviceData.items);
      })
      .catch((caught) =>
        setError(getErrorMessage(caught, "Could not load booking options.")),
      );
  }, [showNew]);
  function closeForm() {
    setShowNew(false);
    setEditing(null);
  }
  function editBooking(booking: Booking) {
    setEditing(booking);
    setForm({
      customerId: booking.customerId,
      vehicleId: booking.vehicleId,
      serviceId: booking.serviceId,
      scheduledDate: booking.scheduledDate.slice(0, 10),
      startTime: booking.startTime.slice(11, 16),
    });
    setShowNew(true);
  }
  async function saveBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const branch =
      managed.business?.branches?.find((item) => item.isPrimary) ??
      managed.business?.branches?.[0];
    if (!managed.business || !branch) return;
    setCreating(true);
    setError(null);
    try {
      if (editing) {
        await bookingsApi.reschedule(editing.id, {
          serviceId: form.serviceId,
          scheduledDate: form.scheduledDate,
          startTime: form.startTime,
        });
      } else {
        await bookingsApi.createForBusiness({
          businessId: managed.business.id,
          branchId: branch.id,
          ...form,
        });
      }
      closeForm();
      await load();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not save the booking."));
    } finally {
      setCreating(false);
    }
  }
  async function update(booking: Booking, status: string) {
    setUpdating(booking.id);
    setError(null);
    setSuccess(null);
    try {
      await bookingsApi.updateStatus(booking.id, { status });
      setSuccess(
        status === "IN_PROGRESS"
          ? `${booking.bookingNumber} was started.`
          : `${booking.bookingNumber} was completed.`,
      );
      await load();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not update the booking."));
    } finally {
      setUpdating(null);
    }
  }
  const columns = [
    {
      id: "id",
      header: "Booking ID",
      cell: (item: Booking) => <strong>{item.bookingNumber}</strong>,
    },
    { id: "customer", header: "Customer", cell: customerName },
    { id: "vehicle", header: "Vehicle", cell: vehicleName },
    {
      id: "service",
      header: "Service",
      cell: (item: Booking) => item.service?.name ?? "—",
    },
    {
      id: "date",
      header: "Date & Time",
      cell: (item: Booking) =>
        `${new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(item.scheduledDate))} · ${item.startTime.slice(11, 16)}`,
    },
    {
      id: "price",
      header: "Price",
      cell: (item: Booking) =>
        formatMoney(item.finalPrice ?? item.estimatedPrice, item.currency),
    },
    {
      id: "status",
      header: "Status",
      cell: (item: Booking) => <StatusBadge status={item.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (item: Booking) => (
        <div className="ui-admin-table-actions">
          {item.status === "CONFIRMED" ? (
            <Button
              size="xs"
              loading={updating === item.id}
              onClick={() => void update(item, "IN_PROGRESS")}
            >
              Start
            </Button>
          ) : item.status === "IN_PROGRESS" ? (
            <Button
              size="xs"
              loading={updating === item.id}
              onClick={() => void update(item, "COMPLETED")}
            >
              Complete
            </Button>
          ) : null}
          {item.status === "CONFIRMED" ? (
            <Button
              size="xs"
              variant="outline"
              onClick={() => editBooking(item)}
            >
              Edit
            </Button>
          ) : (
            <Button
              size="xs"
              variant="outline"
              onClick={() => setSelected(item)}
            >
              View
            </Button>
          )}
        </div>
      ),
    },
  ];
  return (
    <AdminPageLayout
      activeKey="bookings"
      business={managed.business}
      title="Bookings"
    >
      <PageHeader
        title="Bookings"
        subtitle="Manage all customer appointments"
        action={
          <Button
            size="sm"
            disabled={!managed.business}
            onClick={() => setShowNew(true)}
          >
            + New Booking
          </Button>
        }
      />
      {managed.error || error ? (
        <Alert variant="error">{managed.error ?? error}</Alert>
      ) : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
      {showNew ? (
        <Card className="ui-admin-service-form">
          <form onSubmit={saveBooking}>
            <h2>{editing ? "Edit Booking" : "New Booking"}</h2>
            <div className="ui-admin-form-grid">
              <Select
                label="Customer"
                required
                disabled={Boolean(editing)}
                value={form.customerId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    customerId: event.target.value,
                    vehicleId: "",
                  })
                }
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Vehicle"
                required
                disabled={Boolean(editing)}
                value={form.vehicleId}
                onChange={(event) =>
                  setForm({ ...form, vehicleId: event.target.value })
                }
              >
                <option value="">Select vehicle</option>
                {customers
                  .find((customer) => customer.id === form.customerId)
                  ?.vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.label}
                    </option>
                  ))}
              </Select>
              <Select
                label="Service"
                required
                value={form.serviceId}
                onChange={(event) =>
                  setForm({ ...form, serviceId: event.target.value })
                }
              >
                <option value="">Select service</option>
                {services
                  .filter(
                    (service) => service.isActive && service.isOnlineBooking,
                  )
                  .map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
              </Select>
              <Input
                label="Date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                required
                value={form.scheduledDate}
                onChange={(event) =>
                  setForm({ ...form, scheduledDate: event.target.value })
                }
              />
              <Input
                label="Time"
                type="time"
                required
                value={form.startTime}
                onChange={(event) =>
                  setForm({ ...form, startTime: event.target.value })
                }
              />
            </div>
            <div className="ui-admin-page__actions">
              <Button variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" loading={creating}>
                {editing ? "Save Booking" : "Create Booking"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      {selected ? (
        <Card className="ui-admin-service-form">
          <div className="ui-admin-request-card__top">
            <h2>{selected.bookingNumber}</h2>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
          </div>
          <p>
            {customerName(selected)} · {vehicleName(selected)} ·{" "}
            {selected.service?.name}
          </p>
          {selected.customerNotes ? <p>{selected.customerNotes}</p> : null}
        </Card>
      ) : null}
      <Tabs
        label="Booking status"
        value={filter}
        onValueChange={setFilter}
        items={[
          { value: "all", label: "All" },
          { value: "upcoming", label: "Upcoming" },
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
        ]}
      />{" "}
      <div className="ui-admin-filter-row">
        <Input
          label="Filter by date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        {date ? (
          <Button variant="outline" onClick={() => setDate("")}>
            Clear date
          </Button>
        ) : null}
      </div>
      <Card padding="none" className="ui-admin-panel">
        {loading ? (
          <p className="ui-admin-page__section">Loading bookings…</p>
        ) : (
          <DataTable
            columns={columns}
            data={bookings}
            getRowKey={(item) => item.id}
            emptyContent="No bookings match this filter."
          />
        )}
      </Card>
    </AdminPageLayout>
  );
}
