import type {
  Booking,
  CustomerAddress,
  Order,
  Vehicle,
} from "@car-platform/types";
import {
  Avatar,
  Button,
  Card,
  Input,
  PhoneInput,
  ProfileMenuRow,
} from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { AddressForm } from "../components/AddressForm";
import {
  addressesApi,
  authApi,
  bookingsApi,
  ordersApi,
  vehiclesApi,
} from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function ProfilePage() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isManagingAddresses, setIsManagingAddresses] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(() => ({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  }));
  const [error, setError] = useState<string | null>(null);

  function loadAddresses() {
    addressesApi
      .list()
      .then(({ addresses: list }) => setAddresses(list))
      .catch((err) =>
        setError(getErrorMessage(err, "Could not load addresses.")),
      );
  }

  useEffect(() => {
    loadAddresses();
    void Promise.all([
      vehiclesApi.listMine(),
      ordersApi.listMine({ limit: 40 }),
      bookingsApi.listMine({ limit: 40 }),
    ])
      .then(([vehicleResult, orderResult, bookingResult]) => {
        setVehicles(vehicleResult.vehicles);
        setOrders(orderResult.items);
        setBookings(bookingResult.items);
      })
      .catch((reason: unknown) =>
        setError(
          getErrorMessage(reason, "Could not load all profile details."),
        ),
      );
  }, []);

  async function handleAddAddress(
    payload: Parameters<typeof addressesApi.create>[0],
  ) {
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

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSavingProfile(true);
    try {
      await authApi.updateMe(profileForm);
      await refreshProfile();
      setIsEditing(false);
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not update your profile."));
    } finally {
      setIsSavingProfile(false);
    }
  }

  if (!user) return null;

  const vehicleMakes = [
    ...new Set(
      vehicles
        .map((vehicle) => vehicle.make?.name)
        .filter((name): name is string => Boolean(name)),
    ),
  ];
  const lastOrder = orders[0];
  const lastBooking = bookings[0];
  const shortDate = (value: string) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="customer-page profile-page">
      <header className="profile-header">
        <div className="profile-header__identity">
          <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" />
          <div>
            <h1>
              {user.firstName} {user.lastName}
            </h1>
            <p>{user.email}</p>
            <small>
              {user.phone ? `${user.phone} · ` : ""}Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </small>
          </div>
        </div>
        <button
          type="button"
          className="profile-edit-button"
          onClick={() => {
            setError(null);
            setProfileForm({
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone ?? "",
            });
            setIsEditing((value) => !value);
          }}
        >
          {isEditing ? "Close" : "Edit Profile"}
        </button>
      </header>

      {isEditing ? (
        <Card className="profile-edit-card">
          <form className="profile-edit-form" onSubmit={handleProfileSubmit}>
            <Input
              label="First name"
              required
              value={profileForm.firstName}
              onChange={(event) =>
                setProfileForm((value) => ({
                  ...value,
                  firstName: event.target.value,
                }))
              }
            />
            <Input
              label="Last name"
              required
              value={profileForm.lastName}
              onChange={(event) =>
                setProfileForm((value) => ({
                  ...value,
                  lastName: event.target.value,
                }))
              }
            />
            <Input label="Email" value={user.email} disabled />
            <PhoneInput
              label="Phone"
              required
              value={profileForm.phone}
              onValueChange={(phone) =>
                setProfileForm((value) => ({
                  ...value,
                  phone,
                }))
              }
            />
            <p className="profile-edit-form__hint">
              Email changes require a separate verification flow.
            </p>
            {error ? (
              <p
                role="alert"
                className="ui-field__message ui-field__message--error"
              >
                {error}
              </p>
            ) : null}
            <div className="profile-edit-form__actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSavingProfile}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="profile-menu">
        <ProfileMenuRow
          label="My Vehicles"
          description={`${vehicles.length} ${vehicles.length === 1 ? "vehicle" : "vehicles"}${vehicleMakes.length ? ` · ${vehicleMakes.join(", ")}` : ""}`}
          onActivate={() => navigate("/cars")}
        />
        <ProfileMenuRow
          label="Saved Addresses"
          description={`${addresses.length} ${addresses.length === 1 ? "address" : "addresses"} saved`}
          onActivate={() => setIsManagingAddresses((v) => !v)}
        />
        <ProfileMenuRow
          label="Order History"
          description={`${orders.length} ${orders.length === 1 ? "order" : "orders"}${lastOrder ? ` · last on ${shortDate(lastOrder.createdAt)}` : ""}`}
          onActivate={() => navigate("/orders")}
        />
        <ProfileMenuRow
          label="Booking History"
          description={`${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"}${lastBooking ? ` · last on ${shortDate(lastBooking.scheduledDate)}` : ""}`}
          onActivate={() => navigate("/bookings")}
        />
        <ProfileMenuRow
          label="Payment Methods"
          description="No saved payment methods"
          disabled
        />
        <ProfileMenuRow
          label="Notifications"
          description="Notification settings unavailable"
          disabled
        />
        <ProfileMenuRow
          label="Security"
          description="Password · Email verification"
          disabled
        />
        <ProfileMenuRow
          label="Preferences"
          description="English · Light mode"
          disabled
        />
      </div>

      {isManagingAddresses ? (
        <Card className="form-stack">
          {error ? (
            <p
              role="alert"
              className="ui-field__message ui-field__message--error"
            >
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
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveAddress(address.id)}
              >
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
            <Button
              variant="secondary"
              onClick={() => setIsAddingAddress(true)}
            >
              Add a new address
            </Button>
          )}
        </Card>
      ) : null}

      <button type="button" className="profile-signout" onClick={handleLogout}>
        Sign Out
      </button>
    </div>
  );
}
