import { useEffect, useState, type ReactNode } from "react";
import type { BusinessSummary } from "@car-platform/types";
import {
  Avatar,
  DashboardLayout,
  MobileBottomNav,
  SidebarNav,
} from "@car-platform/ui-web";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../auth/useAdminAuth";
import { dashboardApi } from "../../lib/api";
import {
  adminNavigationItems,
  type AdminNavigationKey,
  getAdminNavigationPath,
} from "./adminNavigation";

export function AdminPageLayout({
  activeKey,
  business,
  children,
  notificationCount = 0,
  requestCount,
  title,
}: {
  activeKey: AdminNavigationKey;
  business: BusinessSummary | null;
  children: ReactNode;
  notificationCount?: number;
  requestCount?: number;
  title: string;
}) {
  const navigate = useNavigate();
  const { logout, user } = useAdminAuth();
  const [dashboardCounts, setDashboardCounts] = useState({
    notifications: notificationCount,
    requests: requestCount ?? 0,
  });
  useEffect(() => {
    let active = true;
    void dashboardApi
      .getAdminOverview()
      .then((dashboard) => {
        if (active)
          setDashboardCounts({
            notifications: dashboard.stats.newReviews,
            requests: dashboard.stats.pendingRequests,
          });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  const resolvedNotificationCount =
    notificationCount || dashboardCounts.notifications;
  const resolvedRequestCount = requestCount ?? dashboardCounts.requests;
  const ownerName = user
    ? `${user.firstName} ${user.lastName}`
    : "Business Owner";
  const location =
    business?.branches?.find((branch) => branch.isPrimary)?.city ??
    "Location not added";
  const navItems = adminNavigationItems.map(([key, label, icon, href]) => ({
    key,
    label,
    href,
    icon: <span className="ui-admin-nav-glyph">{icon}</span>,
    badge:
      key === "requests" && resolvedRequestCount
        ? resolvedRequestCount
        : undefined,
  }));

  function signOut() {
    logout();
    navigate("/sign-in", { replace: true });
  }

  return (
    <DashboardLayout
      sidebar={
        <SidebarNav
          className="ui-sidebar--admin"
          items={navItems}
          activeKey={activeKey}
          onSelect={(key) => navigate(getAdminNavigationPath(key))}
          header={
            <div className="ui-admin-sidebar__header">
              <div className="ui-admin-sidebar__brand">
                <span aria-hidden="true" /> EL7A2NY
              </div>
              <small>Admin Portal</small>
              <div className="ui-admin-sidebar__business">
                <Avatar name={business?.name ?? "Business"} size="xs" />
                <span>
                  <strong>{business?.name ?? "Your Business"}</strong>
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
      }
      header={
        <div className="ui-admin-topbar">
          <strong>{title}</strong>
          <div className="ui-admin-topbar__account">
            <time dateTime={new Date().toISOString()}>
              {new Intl.DateTimeFormat("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date())}
            </time>
            <span
              className="ui-admin-topbar__notice"
              aria-label="Notifications"
            >
              ◯
              {resolvedNotificationCount ? (
                <span>{resolvedNotificationCount}</span>
              ) : null}
            </span>
            <Avatar name={ownerName} size="xs" />
            <span className="ui-admin-topbar__chevron" aria-hidden="true">
              ⌄
            </span>
          </div>
        </div>
      }
      mobileNavigation={
        <MobileBottomNav
          items={navItems.slice(0, 5)}
          activeKey={activeKey}
          onSelect={(key) => navigate(getAdminNavigationPath(key))}
        />
      }
    >
      <div className="ui-admin-page">{children}</div>
    </DashboardLayout>
  );
}
