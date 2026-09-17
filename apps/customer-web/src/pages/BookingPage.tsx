import type {
  BusinessBranchSummary,
  ServiceSummary,
  Vehicle,
} from "@car-platform/types";
import {
  Button,
  Card,
  EmptyState,
  Input,
  ProgressStepper,
  SuccessState,
} from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { bookingsApi, businessesApi, servicesApi, vehiclesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function BookingPage() {
  const { businessId, serviceId } = useParams<{
    businessId: string;
    serviceId: string;
  }>();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceSummary | null>(null);
  const [branches, setBranches] = useState<BusinessBranchSummary[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [branchId, setBranchId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingNumber, setBookingNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId || !serviceId) return;
    let cancelled = false;

    Promise.all([
      servicesApi.getById(serviceId),
      businessesApi.listBranches(businessId),
      vehiclesApi.listMine(),
    ])
      .then(([serviceResult, branchResult, vehicleResult]) => {
        if (cancelled) return;
        setService(serviceResult.service);
        setBranches(branchResult.branches);
        setVehicles(vehicleResult.vehicles);
        const [onlyBranch] = branchResult.branches;
        if (branchResult.branches.length === 1 && onlyBranch) {
          setBranchId(onlyBranch.id);
        }
        const preferredVehicle =
          vehicleResult.vehicles.find((v) => v.isPrimary) ??
          vehicleResult.vehicles[0];
        if (preferredVehicle) {
          setVehicleId(preferredVehicle.id);
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err, "Could not load booking details."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [businessId, serviceId]);

  async function handleConfirm() {
    if (!businessId || !serviceId) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const { booking } = await bookingsApi.create({
        businessId,
        serviceId,
        branchId,
        vehicleId,
        scheduledDate,
        startTime,
        customerNotes: customerNotes || undefined,
      });
      setBookingNumber(booking.bookingNumber);
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Could not create this booking."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="loading-block">Loading…</p>;
  }

  if (loadError || !service) {
    return <EmptyState title="Could not load this service" description={loadError ?? undefined} />;
  }

  if (bookingNumber) {
    return (
      <SuccessState
        title="Booking requested"
        description={`Your booking ${bookingNumber} is pending confirmation from the business.`}
        actions={
          <Button onClick={() => navigate("/bookings")}>View my bookings</Button>
        }
      />
    );
  }

  const canGoNext =
    (step === 1 && Boolean(branchId)) ||
    (step === 2 && Boolean(vehicleId)) ||
    (step === 3 && Boolean(scheduledDate) && Boolean(startTime));

  return (
    <div className="center-column form-stack">
      <div>
        <h2>Book {service.name}</h2>
        <p className="muted-text">
          {service.durationMinutes} min · {service.basePrice} {service.currency}
        </p>
      </div>

      <ProgressStepper currentStep={step} totalSteps={4} />

      {step === 1 ? (
        <Card>
          <h3 style={{ marginBottom: "1rem" }}>Choose a branch</h3>
          {branches.length === 0 ? (
            <EmptyState title="No branches available" />
          ) : (
            <div className="form-stack">
              {branches.map((branch) => (
                <label
                  key={branch.id}
                  className="spread-row"
                  style={{ cursor: "pointer" }}
                >
                  <span>
                    <strong>{branch.name}</strong>
                    <br />
                    <span className="muted-text">
                      {branch.addressLine1}, {branch.city}
                    </span>
                  </span>
                  <input
                    type="radio"
                    name="branch"
                    checked={branchId === branch.id}
                    onChange={() => setBranchId(branch.id)}
                  />
                </label>
              ))}
            </div>
          )}
        </Card>
      ) : step === 2 ? (
        <Card>
          <h3 style={{ marginBottom: "1rem" }}>Choose a vehicle</h3>
          {vehicles.length === 0 ? (
            <EmptyState
              title="No vehicles on file"
              description="Add a vehicle to continue booking."
              action={<Link to="/cars">Add a vehicle</Link>}
            />
          ) : (
            <div className="form-stack">
              {vehicles.map((vehicle) => (
                <label
                  key={vehicle.id}
                  className="spread-row"
                  style={{ cursor: "pointer" }}
                >
                  <span>
                    <strong>
                      {vehicle.make?.name} {vehicle.model?.name} ({vehicle.year})
                    </strong>
                    {vehicle.licensePlate ? (
                      <>
                        <br />
                        <span className="muted-text">{vehicle.licensePlate}</span>
                      </>
                    ) : null}
                  </span>
                  <input
                    type="radio"
                    name="vehicle"
                    checked={vehicleId === vehicle.id}
                    onChange={() => setVehicleId(vehicle.id)}
                  />
                </label>
              ))}
            </div>
          )}
        </Card>
      ) : step === 3 ? (
        <Card className="form-stack">
          <h3>Choose date and time</h3>
          <Input
            label="Date"
            type="date"
            required
            value={scheduledDate}
            onChange={(event) => setScheduledDate(event.target.value)}
          />
          <Input
            label="Start time"
            type="time"
            required
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
          <Input
            label="Notes (optional)"
            value={customerNotes}
            onChange={(event) => setCustomerNotes(event.target.value)}
          />
        </Card>
      ) : (
        <Card className="form-stack">
          <h3>Review and confirm</h3>
          <p>
            <strong>Service:</strong> {service.name}
          </p>
          <p>
            <strong>Branch:</strong>{" "}
            {branches.find((b) => b.id === branchId)?.name}
          </p>
          <p>
            <strong>Vehicle:</strong>{" "}
            {(() => {
              const vehicle = vehicles.find((v) => v.id === vehicleId);
              return vehicle
                ? `${vehicle.make?.name} ${vehicle.model?.name}`
                : "";
            })()}
          </p>
          <p>
            <strong>When:</strong> {scheduledDate} at {startTime}
          </p>
          <p>
            <strong>Estimated price:</strong> {service.basePrice}{" "}
            {service.currency}
          </p>
          {submitError ? (
            <p role="alert" className="ui-field__message ui-field__message--error">
              {submitError}
            </p>
          ) : null}
        </Card>
      )}

      <div className="inline-actions">
        {step > 1 ? (
          <Button variant="secondary" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : null}
        {step < 4 ? (
          <Button disabled={!canGoNext} onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button loading={isSubmitting} onClick={handleConfirm}>
            Confirm booking
          </Button>
        )}
      </div>
    </div>
  );
}
