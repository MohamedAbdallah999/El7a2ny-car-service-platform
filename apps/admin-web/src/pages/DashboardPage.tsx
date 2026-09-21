import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AdminDashboardOrderItem,
  AdminDashboardResponse,
  AdminDashboardScheduleItem,
} from "@car-platform/types";
import {
  Alert,
  Avatar,
  Button,
  Card,
  DashboardLayout,
  DataTable,
  MobileBottomNav,
  PageHeader,
  SidebarNav,
  Stat,
  StatsGrid,
  StatusBadge,
} from "@car-platform/ui-web";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../auth/useAdminAuth";
import { dashboardApi, serviceRequestsApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

const navItems = [
  ["dashboard", "Dashboard", "▦", "#dashboard"],
  ["business", "My Business", "▣", "#business"],
  ["bookings", "Bookings", "◷", "#schedule"],
  ["requests", "Service Requests", "◇", "#requests"],
  ["services", "Services", "○", "#schedule"],
  ["products", "Products", "□", "#orders"],
  ["inventory", "Inventory", "▤", "#inventory"],
  ["orders", "Orders", "▱", "#orders"],
  ["customers", "Customers", "♙", "#customers"],
  ["reviews", "Reviews", "☆", "#reviews"],
  ["revenue", "Revenue", "⌁", "#revenue"],
  ["reports", "Reports", "▥", "#dashboard"],
  ["promotions", "Promotions", "%", "#dashboard"],
  ["settings", "Settings", "⚙", "#business"],
] as const;

const shortNavItems = navItems.slice(0, 5);

const formatDate = (value: Date): string =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);

const formatTopbarDate = (value: Date): string =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

const formatShortDate = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatTime = (value: string): string => {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(1970, 0, 1, hours, minutes));
};

const formatMoney = (value: string, currency: string): string =>
  `${Number(value).toLocaleString("en-EG", { maximumFractionDigits: 2 })} ${currency}`;

function NavGlyph({ children }: { children: string }) {
  return <span className="ui-admin-nav-glyph">{children}</span>;
}

function SectionHeader({ detail, title }: { detail?: string; title: string }) {
  return (
    <header className="ui-admin-panel__header">
      <h2>{title}</h2>
      {detail ? <span>{detail}</span> : null}
    </header>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { logout, user } = useAdminAuth();
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(
    null,
  );

  const loadDashboard = useCallback(async () => {
    try {
      setDashboard(await dashboardApi.getAdminOverview());
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not load the dashboard."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    void dashboardApi
      .getAdminOverview()
      .then((response) => {
        if (isCurrent) setDashboard(response);
      })
      .catch((caught: unknown) => {
        if (isCurrent) {
          setError(getErrorMessage(caught, "Could not load the dashboard."));
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const navigation = useMemo(
    () =>
      navItems.map(([key, label, icon, href]) => ({
        key,
        label,
        href,
        icon: <NavGlyph>{icon}</NavGlyph>,
        badge:
          key === "requests" && dashboard?.stats.pendingRequests
            ? dashboard.stats.pendingRequests
            : key === "reviews" && dashboard?.stats.newReviews
              ? dashboard.stats.newReviews
              : undefined,
      })),
    [dashboard],
  );

  const mobileNavigation = useMemo(
    () =>
      shortNavItems.map(([key, label, icon, href]) => ({
        key,
        label,
        href,
        icon: <NavGlyph>{icon}</NavGlyph>,
      })),
    [],
  );

  function signOut() {
    logout();
    navigate("/sign-in", { replace: true });
  }

  async function updateRequest(requestId: string, status: string) {
    setUpdatingRequestId(requestId);
    setError(null);
    try {
      await serviceRequestsApi.updateStatus(requestId, status);
      await loadDashboard();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not update the request."));
    } finally {
      setUpdatingRequestId(null);
    }
  }

  function downloadReport() {
    if (!dashboard) return;
    const rows = [
      ["Metric", "Value"],
      ["Today's bookings", dashboard.stats.todayBookings],
      ["Completed today", dashboard.stats.completedToday],
      ["Pending requests", dashboard.stats.pendingRequests],
      ["Active services", dashboard.stats.activeServices],
      ["Today's orders", dashboard.stats.todayOrders],
      ["Today's revenue", dashboard.stats.todayRevenue],
      ["Total customers", dashboard.stats.totalCustomers],
      ["New reviews", dashboard.stats.newReviews],
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `el7a2ny-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const businessName = dashboard?.business?.name ?? "Your Business";
  const location = dashboard?.business?.city ?? "Location not added";
  const ownerName = user ? `${user.firstName} ${user.lastName}` : "Admin";
  const greeting = new Date().getHours() < 12 ? "Good morning" : "Welcome back";

  const scheduleColumns = [
    {
      id: "time",
      header: "Time",
      cell: (item: AdminDashboardScheduleItem) => (
        <strong>{formatTime(item.time)}</strong>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (item: AdminDashboardScheduleItem) => item.customerName,
    },
    {
      id: "vehicle",
      header: "Vehicle",
      cell: (item: AdminDashboardScheduleItem) => item.vehicleName,
    },
    {
      id: "service",
      header: "Service",
      cell: (item: AdminDashboardScheduleItem) => item.serviceName,
    },
    {
      id: "status",
      header: "Status",
      cell: (item: AdminDashboardScheduleItem) => (
        <StatusBadge status={item.status} />
      ),
    },
  ];

  const orderColumns = [
    {
      id: "order",
      header: "Order ID",
      cell: (item: AdminDashboardOrderItem) => (
        <strong>{item.orderNumber}</strong>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (item: AdminDashboardOrderItem) => item.customerName,
    },
    {
      id: "products",
      header: "Products",
      cell: (item: AdminDashboardOrderItem) => item.products,
    },
    {
      id: "quantity",
      header: "Qty",
      cell: (item: AdminDashboardOrderItem) => item.quantity,
    },
    {
      id: "total",
      header: "Total",
      cell: (item: AdminDashboardOrderItem) => (
        <strong>{formatMoney(item.total, item.currency)}</strong>
      ),
    },
    {
      id: "payment",
      header: "Payment",
      cell: (item: AdminDashboardOrderItem) => (
        <StatusBadge status={item.paymentStatus} />
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (item: AdminDashboardOrderItem) => (
        <StatusBadge status={item.status} />
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: (item: AdminDashboardOrderItem) => formatShortDate(item.createdAt),
    },
  ];

  const sidebar = (
    <SidebarNav
      className="ui-sidebar--admin"
      items={navigation}
      activeKey="dashboard"
      header={
        <div className="ui-admin-sidebar__header">
          <div className="ui-admin-sidebar__brand">
            <span aria-hidden="true" /> EL7A2NY
          </div>
          <small>Admin Portal</small>
          <div className="ui-admin-sidebar__business" id="business">
            <Avatar name={businessName} size="xs" />
            <span>
              <strong>{businessName}</strong>
              <small>{location}</small>
            </span>
          </div>
        </div>
      }
      footer={
        <div className="ui-admin-sidebar__profile">
          <Avatar name={ownerName} size="xs" />
          <span>
            <strong>{ownerName}</strong>
            <small>Business Owner</small>
          </span>
          <button type="button" onClick={signOut} aria-label="Sign out">
            ↪
          </button>
        </div>
      }
    />
  );

  return (
    <DashboardLayout
      sidebar={sidebar}
      header={
        <div className="ui-admin-topbar">
          <strong>Dashboard</strong>
          <div className="ui-admin-topbar__account">
            <time dateTime={new Date().toISOString()}>
              {formatTopbarDate(new Date())}
            </time>
            <span
              className="ui-admin-topbar__notice"
              aria-label="Notifications"
            >
              ◯
              {dashboard?.stats.newReviews ? (
                <span>{dashboard.stats.newReviews}</span>
              ) : null}
            </span>
            <Avatar name={ownerName} size="xs" />
          </div>
        </div>
      }
      mobileNavigation={
        <MobileBottomNav items={mobileNavigation} activeKey="dashboard" />
      }
    >
      <div className="ui-admin-home" id="dashboard">
        <PageHeader
          title={`${greeting}, ${businessName}`}
          subtitle={`${formatDate(new Date())} · Here's how your shop is performing today.`}
          action={
            <div className="ui-admin-home__actions">
              <Button variant="outline" size="sm" onClick={downloadReport}>
                Download Report
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  document
                    .getElementById("schedule")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                + New Booking
              </Button>
            </div>
          }
        />

        {error ? <Alert variant="error">{error}</Alert> : null}
        {isLoading ? (
          <Card className="ui-admin-home__loading">Loading dashboard…</Card>
        ) : null}
        {!isLoading && !dashboard?.business ? (
          <Alert variant="warning" title="Business setup is incomplete">
            No business is connected to this admin account yet.
          </Alert>
        ) : null}
        {dashboard?.business &&
        dashboard.business.verificationStatus !== "VERIFIED" ? (
          <Alert variant="info" title="Business verification pending">
            Your profile and documents are saved. Public verification status:{" "}
            {dashboard.business.verificationStatus.replaceAll("_", " ")}.
          </Alert>
        ) : null}

        {dashboard ? (
          <>
            <StatsGrid columns={4} className="ui-admin-home__stats">
              <Stat
                value={dashboard.stats.todayBookings}
                label="Today's Bookings"
                detail={`${dashboard.stats.activeServices} in progress`}
              />
              <Stat
                className="ui-admin-home__urgent-stat"
                value={dashboard.stats.pendingRequests}
                label="Pending Requests"
                detail="Need attention"
              />
              <Stat
                value={dashboard.stats.activeServices}
                label="Active Services"
                detail="On the floor now"
              />
              <Stat
                id="revenue"
                value={formatMoney(
                  dashboard.stats.todayRevenue,
                  dashboard.stats.currency,
                )}
                label="Today's Revenue"
                detail="Services + orders"
              />
              <Stat
                value={dashboard.stats.completedToday}
                label="Completed Today"
                detail={`Out of ${dashboard.stats.todayBookings} booked`}
              />
              <Stat
                value={dashboard.stats.todayOrders}
                label="Today's Orders"
                detail="Parts & products"
              />
              <Stat
                id="customers"
                value={dashboard.stats.totalCustomers}
                label="Total Customers"
                detail="All time"
              />
              <Stat
                id="reviews"
                value={dashboard.stats.newReviews}
                label="New Reviews"
                detail={`Average: ${dashboard.business?.averageRating ?? "0.0"}★`}
              />
            </StatsGrid>

            {dashboard.inventoryAlerts.length ? (
              <div className="ui-admin-home__alerts" id="inventory">
                {dashboard.inventoryAlerts.map((item) => (
                  <Alert
                    key={item.id}
                    variant={
                      item.status === "OUT_OF_STOCK" ? "error" : "warning"
                    }
                  >
                    {item.status === "OUT_OF_STOCK" ? "✕" : "⚠"}{" "}
                    {item.productName} —{" "}
                    {item.status === "OUT_OF_STOCK"
                      ? "is out of stock."
                      : `only ${item.availableQuantity} units left. Reorder recommended.`}
                  </Alert>
                ))}
              </div>
            ) : null}

            <div className="ui-admin-home__grid">
              <Card padding="none" id="schedule" className="ui-admin-panel">
                <SectionHeader
                  title="Today's Schedule"
                  detail={`${dashboard.schedule.length} appointments`}
                />
                <DataTable
                  columns={scheduleColumns}
                  data={dashboard.schedule}
                  getRowKey={(item) => item.id}
                  emptyContent="No appointments scheduled for today."
                  className="ui-admin-panel__table"
                />
              </Card>

              <Card padding="none" id="requests" className="ui-admin-panel">
                <SectionHeader
                  title="Pending Requests"
                  detail={`${dashboard.stats.pendingRequests} new`}
                />
                <div className="ui-admin-requests">
                  {dashboard.pendingRequests.length ? (
                    dashboard.pendingRequests.map((request) => (
                      <article className="ui-admin-request" key={request.id}>
                        <div className="ui-admin-request__title">
                          <strong>{request.customerName}</strong>
                          <StatusBadge status={request.priority} />
                        </div>
                        <p>{request.title}</p>
                        <small>{request.vehicleName}</small>
                        <div className="ui-admin-request__actions">
                          <Button
                            variant="outline"
                            size="xs"
                            loading={updatingRequestId === request.id}
                            onClick={() =>
                              void updateRequest(request.id, "REJECTED")
                            }
                          >
                            Reject
                          </Button>
                          <Button
                            size="xs"
                            loading={updatingRequestId === request.id}
                            onClick={() =>
                              void updateRequest(request.id, "REVIEWING")
                            }
                          >
                            Accept
                          </Button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="ui-admin-panel__empty">
                      No requests need attention.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <Card padding="none" id="orders" className="ui-admin-panel">
              <SectionHeader title="Recent Orders" detail="View all" />
              <DataTable
                columns={orderColumns}
                data={dashboard.recentOrders}
                getRowKey={(item) => item.id}
                emptyContent="No product orders yet."
                className="ui-admin-panel__table"
              />
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
