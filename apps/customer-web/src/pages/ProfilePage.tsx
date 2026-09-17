import type { CustomerAddress } from "@car-platform/types";
import { Avatar, Button, Card, PageHeader, ProfileMenuRow } from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { AddressForm } from "../components/AddressForm";
import { addressesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isManagingAddresses, setIsManagingAddresses] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadAddresses() {
    addressesApi
      .list()
      .then(({ addresses: list }) => setAddresses(list))
      .catch((err) => setError(getErrorMessage(err, "Could not load addresses.")));
  }

  useEffect(() => {
    if (isManagingAddresses) loadAddresses();
  }, [isManagingAddresses]);

  async function handleAddAddress(payload: Parameters<typeof addressesApi.create>[0]) {
    await addressesApi.create(payload);
    setIsAddingAddress(false);
    loadAddresses();
  }

  async function handleRemoveAddress(addressId: string) {
    await addressesApi.remove(addressId);
    loadAddresses();
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (!user) return null;

  return (
    <div className="center-column form-stack" style={{ gap: "1.5rem" }}>
      <PageHeader title="Profile" />

      <Card className="spread-row">
        <div className="inline-actions">
          <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" />
          <div>
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            <p className="muted-text">{user.email}</p>
            {user.phone ? <p className="muted-text">{user.phone}</p> : null}
          </div>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: "0 1rem" }}>
          <ProfileMenuRow
            label="Manage addresses"
            description={`${addresses.length || ""} saved`}
            onActivate={() => setIsManagingAddresses((v) => !v)}
          />
        </div>
      </Card>

      {isManagingAddresses ? (
        <Card className="form-stack">
          {error ? (
            <p role="alert" className="ui-field__message ui-field__message--error">
              {error}
            </p>
          ) : null}

          {addresses.map((address) => (
            <div key={address.id} className="spread-row">
              <span>
                <strong>{address.label || address.recipientName}</strong>
                <br />
                <span className="muted-text">
                  {address.addressLine1}, {address.city}
                </span>
              </span>
              <Button size="sm" variant="ghost" onClick={() => handleRemoveAddress(address.id)}>
                Remove
              </Button>
            </div>
          ))}

          {isAddingAddress ? (
            <AddressForm
              onSubmit={handleAddAddress}
              onCancel={() => setIsAddingAddress(false)}
            />
          ) : (
            <Button variant="secondary" onClick={() => setIsAddingAddress(true)}>
              Add a new address
            </Button>
          )}
        </Card>
      ) : null}

      <Button variant="destructive" onClick={handleLogout}>
        Sign out
      </Button>
    </div>
  );
}
