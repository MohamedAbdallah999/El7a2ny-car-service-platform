export const adminNavigationItems = [
  ["dashboard", "Dashboard", "\u25eb", "/dashboard"],
  ["business", "My Business", "\u25a3", "/business"],
  ["bookings", "Bookings", "\u25f7", "/bookings"],
  ["requests", "Service Requests", "\u25c7", "/service-requests"],
  ["services", "Services", "\u25ef", "/services"],
  ["products", "Products", "\u25a1", "/products"],
  ["inventory", "Inventory", "\u25a4", "/inventory"],
  ["orders", "Orders", "\u25f1", "/orders"],
  ["customers", "Customers", "\u2659", "/customers"],
  ["reviews", "Reviews", "\u2606", "/dashboard#reviews"],
  ["revenue", "Revenue", "\u2301", "/dashboard#revenue"],
  ["reports", "Reports", "\u25a5", "/dashboard"],
  ["promotions", "Promotions", "%", "/dashboard"],
  ["settings", "Settings", "\u2699", "/business"],
] as const;

export type AdminNavigationKey = (typeof adminNavigationItems)[number][0];

export function getAdminNavigationPath(key: AdminNavigationKey): string {
  return (
    adminNavigationItems.find(([itemKey]) => itemKey === key)?.[3] ??
    "/dashboard"
  );
}
