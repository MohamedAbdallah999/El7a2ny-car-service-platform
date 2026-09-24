import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "./useAdminAuth";

export function ProtectedAdminRoute() {
  const { user, isLoading } = useAdminAuth();
  if (isLoading) return null;
  return user ? <Outlet /> : <Navigate to="/sign-in" replace />;
}

export function GuestAdminRoute() {
  const { user, isLoading } = useAdminAuth();
  if (isLoading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
