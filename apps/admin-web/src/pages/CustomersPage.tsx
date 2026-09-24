import { useEffect, useState } from "react";
import type {
  AdminCustomerBooking,
  AdminCustomerDetails,
  AdminCustomerSummary,
} from "@car-platform/types";
import {
  Alert,
  Avatar,
  Button,
  Card,
  DataTable,
  PageHeader,
  StatusBadge,
} from "@car-platform/ui-web";
import { AdminPageLayout } from "./components/AdminPageLayout";
import { useManagedBusiness } from "./components/useManagedBusiness";
import { dashboardApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

const formatDate = (value: string | null): string =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";

const formatMoney = (value: string, currency: string): string =>
  `${Number(value).toLocaleString("en-EG", { maximumFractionDigits: 2 })} ${currency}`;

export function CustomersPage() {
  const managed = useManagedBusiness();
  const businessId = managed.business?.id;
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminCustomerDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (managed.isLoading) return;
    if (!businessId) {
      return;
    }
    let active = true;
    void dashboardApi
      .listAdminCustomers(businessId)
      .then(({ customers: items }) => {
        if (active) setCustomers(items);
      })
      .catch((caught) => {
        if (active) {
          setError(getErrorMessage(caught, "Could not load customers."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [businessId, managed.isLoading]);

  async function viewCustomer(customerId: string) {
    if (!businessId) return;
    setSelectedId(customerId);
    setSelected(null);
    setDetailsLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getAdminCustomer(
        customerId,
        businessId,
      );
      setSelected(response.customer);
    } catch (caught) {
      setSelectedId(null);
      setError(getErrorMessage(caught, "Could not load customer details."));
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeCustomer() {
    setSelectedId(null);
    setSelected(null);
  }

  const columns = [
    {
      id: "customer",
      header: "Customer",
      cell: (item: AdminCustomerSummary) => (
        <div className="ui-admin-customer">
          <Avatar name={item.name} size="xs" />
          <strong>{item.name}</strong>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: (item: AdminCustomerSummary) => (
        <>
          <a href={item.phone ? `tel:${item.phone}` : undefined}>
            {item.phone ?? "—"}
          </a>
          <br />
          <a href={`mailto:${item.email}`}>{item.email}</a>
        </>
      ),
    },
    {
      id: "vehicles",
      header: "Vehicles",
      cell: (item: AdminCustomerSummary) => item.vehicleCount,
    },
    {
      id: "bookings",
      header: "Bookings",
      cell: (item: AdminCustomerSummary) => item.bookingCount,
    },
    {
      id: "orders",
      header: "Orders",
      cell: (item: AdminCustomerSummary) => item.orderCount,
    },
    {
      id: "last",
      header: "Last Visit",
      cell: (item: AdminCustomerSummary) => formatDate(item.lastVisit),
    },
    {
      id: "status",
      header: "Status",
      cell: (item: AdminCustomerSummary) => (
        <StatusBadge status={item.status} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (item: AdminCustomerSummary) => (
        <Button
          size="xs"
          variant="outline"
          loading={detailsLoading && selectedId === item.id}
          onClick={() => void viewCustomer(item.id)}
        >
          View
        </Button>
      ),
    },
  ];

  const bookingColumns = [
    {
      id: "booking",
      header: "Booking",
      cell: (item: AdminCustomerBooking) => (
        <div>
          <strong>{item.bookingNumber}</strong>
          <small className="ui-admin-detail__muted">{item.service.name}</small>
        </div>
      ),
    },
    {
      id: "schedule",
      header: "Schedule",
      cell: (item: AdminCustomerBooking) => (
        <div>
          {formatDate(item.scheduledDate)}
          <small className="ui-admin-detail__muted">
            {item.startTime}–{item.endTime}
          </small>
        </div>
      ),
    },
    {
      id: "vehicle",
      header: "Vehicle",
      cell: (item: AdminCustomerBooking) => item.vehicle.label,
    },
    {
      id: "branch",
      header: "Branch",
      cell: (item: AdminCustomerBooking) => (
        <div>
          {item.branch.name}
          <small className="ui-admin-detail__muted">
            {item.branch.addressLine1}, {item.branch.city}
          </small>
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      cell: (item: AdminCustomerBooking) =>
        formatMoney(item.finalPrice ?? item.estimatedPrice, item.currency),
    },
    {
      id: "status",
      header: "Status",
      cell: (item: AdminCustomerBooking) => (
        <StatusBadge status={item.status} />
      ),
    },
  ];

  return (
    <AdminPageLayout
      activeKey="customers"
      business={managed.business}
      title="Customers"
    >
      <PageHeader
        title="Customers"
        subtitle={`Customers who have booked or ordered from ${managed.business?.name ?? "your business"}`}
      />
      {managed.error || error ? (
        <Alert variant="error">{managed.error ?? error}</Alert>
      ) : null}

      {selected ? (
        <Card className="ui-admin-customer-detail">
          <div className="ui-admin-customer-detail__header">
            <div className="ui-admin-customer-detail__identity">
              {selected.profileImageUrl ? (
                <img src={selected.profileImageUrl} alt="" />
              ) : (
                <Avatar name={selected.name} size="lg" />
              )}
              <div>
                <h2>{selected.name}</h2>
                <p>
                  <a href={`mailto:${selected.email}`}>{selected.email}</a>
                  {" · "}
                  {selected.phone ? (
                    <a href={`tel:${selected.phone}`}>{selected.phone}</a>
                  ) : (
                    "No phone"
                  )}
                </p>
                <small>
                  Customer since {formatDate(selected.customerSince)}
                </small>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <Button size="xs" variant="outline" onClick={closeCustomer}>
              Close
            </Button>
          </div>

          <section className="ui-admin-customer-detail__section">
            <h3>Vehicles ({selected.vehicles.length})</h3>
            {selected.vehicles.length ? (
              <div className="ui-admin-customer-detail__vehicles">
                {selected.vehicles.map((vehicle) => (
                  <article key={vehicle.id}>
                    <div>
                      <strong>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </strong>
                      {vehicle.isPrimary ? (
                        <StatusBadge status="PRIMARY" />
                      ) : null}
                    </div>
                    <p>
                      {[vehicle.nickname, vehicle.trim, vehicle.color]
                        .filter(Boolean)
                        .join(" · ") || "No additional description"}
                    </p>
                    <dl>
                      <div>
                        <dt>Plate</dt>
                        <dd>{vehicle.licensePlate ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Mileage</dt>
                        <dd>
                          {vehicle.mileage?.toLocaleString("en-EG") ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Fuel</dt>
                        <dd>{vehicle.fuelType ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Transmission</dt>
                        <dd>{vehicle.transmission ?? "—"}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <p className="ui-admin-panel__empty">No vehicles recorded.</p>
            )}
          </section>

          <section className="ui-admin-customer-detail__section">
            <h3>Bookings with this business ({selected.bookings.length})</h3>
            <DataTable
              columns={bookingColumns}
              data={selected.bookings}
              getRowKey={(item) => item.id}
              emptyContent="No bookings with this business."
            />
            {selected.bookings.some(
              (booking) =>
                booking.customerNotes ||
                booking.businessNotes ||
                booking.cancellationReason,
            ) ? (
              <div className="ui-admin-customer-detail__notes">
                {selected.bookings
                  .filter(
                    (booking) =>
                      booking.customerNotes ||
                      booking.businessNotes ||
                      booking.cancellationReason,
                  )
                  .map((booking) => (
                    <p key={booking.id}>
                      <strong>{booking.bookingNumber}:</strong>{" "}
                      {booking.customerNotes ??
                        booking.businessNotes ??
                        booking.cancellationReason}
                    </p>
                  ))}
              </div>
            ) : null}
          </section>

          <section className="ui-admin-customer-detail__section">
            <h3>Orders with this business ({selected.orders.length})</h3>
            {selected.orders.length ? (
              <div className="ui-admin-customer-detail__orders">
                {selected.orders.map((order) => (
                  <article key={order.id}>
                    <header>
                      <div>
                        <strong>{order.orderNumber}</strong>
                        <small>{formatDate(order.createdAt)}</small>
                      </div>
                      <StatusBadge status={order.status} />
                    </header>
                    <ul>
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <span>
                            {item.productName} ({item.sku}) × {item.quantity}
                          </span>
                          <strong>
                            {formatMoney(item.totalAmount, order.currency)}
                          </strong>
                        </li>
                      ))}
                    </ul>
                    <footer>
                      <span>
                        Payment: <StatusBadge status={order.paymentStatus} />
                      </span>
                      {order.shipment ? (
                        <span>
                          Shipment:{" "}
                          <StatusBadge status={order.shipment.status} />
                        </span>
                      ) : null}
                      <strong>
                        Business total:{" "}
                        {formatMoney(order.total, order.currency)}
                      </strong>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <p className="ui-admin-panel__empty">
                No orders with this business.
              </p>
            )}
          </section>
        </Card>
      ) : detailsLoading ? (
        <Card className="ui-admin-service-form">Loading customer details…</Card>
      ) : null}

      <Card padding="none" className="ui-admin-panel">
        {managed.isLoading || (Boolean(businessId) && loading) ? (
          <p className="ui-admin-page__section">Loading customers…</p>
        ) : (
          <DataTable
            columns={columns}
            data={customers}
            getRowKey={(item) => item.id}
            emptyContent="No customers found."
          />
        )}
      </Card>
    </AdminPageLayout>
  );
}
