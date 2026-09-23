import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { MyBusinessPage } from "./pages/MyBusinessPage";
import { BookingsPage } from "./pages/BookingsPage";
import { ServiceRequestsPage } from "./pages/ServiceRequestsPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ProductsPage } from "./pages/ProductsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { OrdersPage } from "./pages/OrdersPage";
import { CustomersPage } from "./pages/CustomersPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { SignInPage } from "./pages/SignInPage";
import { GuestAdminRoute, ProtectedAdminRoute } from "./auth/AdminRoutes";

function App() {
  return (
    <Routes>
      <Route element={<GuestAdminRoute />}>
        <Route path="/sign-in" element={<SignInPage />} />
      </Route>
      <Route path="/register" element={<RegistrationPage />} />
      <Route element={<ProtectedAdminRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/business" element={<MyBusinessPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/service-requests" element={<ServiceRequestsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/customers" element={<CustomersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}

export default App;
