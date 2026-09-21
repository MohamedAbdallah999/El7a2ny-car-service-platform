import { useEffect, useState } from "react";
import type { BusinessSummary } from "@car-platform/types";
import { Alert, Button } from "@car-platform/ui-web";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../auth/useAdminAuth";
import { businessesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";
import { BusinessAuthShell } from "./components/BusinessAuthShell";

export function DashboardPage() {
  const navigate = useNavigate();
  const { logout, user } = useAdminAuth();
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    businessesApi
      .listMine({ limit: 20 })
      .then((result) => setBusinesses(result.items))
      .catch((caught) =>
        setError(getErrorMessage(caught, "Could not load your businesses.")),
      );
  }, []);

  function signOut() {
    logout();
    navigate("/sign-in", { replace: true });
  }

  return (
    <BusinessAuthShell mode="login">
      <section className="ui-business-auth ui-business-auth__success">
        <div className="ui-business-auth__success-icon" aria-hidden="true">
          ✓
        </div>
        <h2>Welcome, {user?.firstName}</h2>
        <p>Your business portal is connected and ready.</p>
        {error ? <Alert variant="error">{error}</Alert> : null}
        {businesses.map((business) => (
          <div className="ui-business-auth__summary" key={business.id}>
            <div className="ui-business-auth__summary-row">
              <span>Business Name</span>
              <strong>{business.name}</strong>
            </div>
            <div className="ui-business-auth__summary-row">
              <span>Status</span>
              <strong>
                {business.verificationStatus.replaceAll("_", " ")}
              </strong>
            </div>
            <div className="ui-business-auth__summary-row">
              <span>Business ID</span>
              <strong>{business.id.slice(0, 8)}</strong>
            </div>
          </div>
        ))}
        <div className="ui-business-auth__success-action">
          <Button onClick={signOut}>Sign Out</Button>
        </div>
      </section>
    </BusinessAuthShell>
  );
}
