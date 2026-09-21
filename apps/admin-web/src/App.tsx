import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
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
      </Route>
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}

export default App;
