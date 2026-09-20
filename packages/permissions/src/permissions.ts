import type { UserRole } from "@car-platform/constants";

// Resources line up with backend/prisma/schema.prisma domains, not with any
// single module — most of these (businesses, bookings, products, ...) don't
// have a backend module yet, but the role matrix is fixed by the product's
// three-role model regardless of build order, so it's defined here once
// up front rather than piecemeal per module.
export type PermissionResource =
  | "profile"
  | "adminInvitations"
  | "businesses"
  | "branches"
  | "vehicles"
  | "services"
  | "bookings"
  | "serviceRequests"
  | "products"
  | "inventory"
  | "orders"
  | "payments"
  | "reviews"
  | "promotions"
  | "notifications"
  | "disputes"
  | "supportTickets"
  | "financials"
  | "platformSettings";

export type PermissionAction = "create" | "read" | "update" | "delete";

export type Permission = `${PermissionResource}:${PermissionAction}`;

const ALL_ACTIONS: PermissionAction[] = ["create", "read", "update", "delete"];

const permissionsFor = (
  resource: PermissionResource,
  actions: PermissionAction[] = ALL_ACTIONS,
): Permission[] =>
  actions.map((action) => `${resource}:${action}` as Permission);

// SUPER_ADMIN is intentionally "*" rather than an enumerated list: platform
// administration (invitations, verification review, platform settings,
// dispute/financial oversight) touches every resource, and enumerating it
// would just re-derive "everything".
export const ROLE_PERMISSIONS: Record<UserRole, Permission[] | "*"> = {
  SUPER_ADMIN: "*",
  ADMIN: [
    ...permissionsFor("profile", ["read", "update"]),
    ...permissionsFor("businesses", ["read", "update"]),
    ...permissionsFor("branches"),
    ...permissionsFor("services"),
    ...permissionsFor("products"),
    ...permissionsFor("inventory"),
    ...permissionsFor("bookings", ["read", "update"]),
    ...permissionsFor("serviceRequests", ["read", "update"]),
    ...permissionsFor("orders", ["read", "update"]),
    ...permissionsFor("payments", ["read"]),
    ...permissionsFor("reviews", ["read", "update"]),
    ...permissionsFor("promotions"),
    ...permissionsFor("notifications", ["read"]),
    ...permissionsFor("disputes", ["read", "update"]),
    ...permissionsFor("supportTickets", ["read", "update"]),
    ...permissionsFor("financials", ["read"]),
  ],
  CUSTOMER: [
    ...permissionsFor("profile", ["read", "update"]),
    ...permissionsFor("vehicles"),
    ...permissionsFor("bookings", ["create", "read", "update"]),
    ...permissionsFor("serviceRequests", ["create", "read"]),
    ...permissionsFor("orders", ["create", "read"]),
    ...permissionsFor("payments", ["create", "read"]),
    ...permissionsFor("reviews", ["create", "read", "update"]),
    ...permissionsFor("promotions", ["read"]),
    ...permissionsFor("notifications", ["read", "update"]),
    ...permissionsFor("disputes", ["create", "read"]),
    ...permissionsFor("supportTickets", ["create", "read"]),
  ],
};

export const hasPermission = (
  role: UserRole,
  permission: Permission,
): boolean => {
  const granted = ROLE_PERMISSIONS[role];
  return granted === "*" || granted.includes(permission);
};

export const hasAnyPermission = (
  role: UserRole,
  permissions: Permission[],
): boolean => permissions.some((permission) => hasPermission(role, permission));
