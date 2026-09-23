import type {
  Booking,
  BusinessBranchSummary,
  ServiceSummary,
  Vehicle,
} from "@car-platform/types";
import { Button, EmptyState } from "@car-platform/ui-web";
import { ImagePlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  bookingsApi,
  businessesApi,
  servicesApi,
  vehiclesApi,
} from "../lib/api";
import { getErrorMessage } from "../lib/error";

const STEP_LABELS = [
  "Service",
  "Shop",
  "Vehicle",
  "Date",
  "Time",
  "Notes",
  "Photos",
  "Review",
  "Payment",
] as const;

const TIME_SLOTS = [
  ["08:00", "8:00 AM"],
  ["09:00", "9:00 AM"],
  ["10:00", "10:00 AM"],
  ["11:00", "11:00 AM"],
  ["12:00", "12:00 PM"],
  ["13:00", "1:00 PM"],
  ["14:00", "2:00 PM"],
  ["15:00", "3:00 PM"],
  ["16:00", "4:00 PM"],
  ["17:00", "5:00 PM"],
  ["18:00", "6:00 PM"],
  ["19:00", "7:00 PM"],
] as const;

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(value: string, includeWeekday = false) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    ...(includeWeekday ? { weekday: "long" as const } : {}),
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function vehicleName(vehicle: Vehicle | undefined) {
  if (!vehicle) return "—";
  return `${vehicle.make?.name ?? ""} ${vehicle.model?.name ?? ""} ${vehicle.year}`.trim();
}

export function BookingPage() {
  const { businessId, serviceId } = useParams<{
    businessId: string;
    serviceId: string;
  }>();
  const navigate = useNavigate();

  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [branches, setBranches] = useState<BusinessBranchSummary[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId ?? "");
  const [branchId, setBranchId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );

  useEffect(() => {
    if (!businessId || !serviceId) return;
    let cancelled = false;

    Promise.all([
      servicesApi.getById(serviceId),
      servicesApi.list({ businessId, limit: 50 }),
      businessesApi.listBranches(businessId),
      vehiclesApi.listMine(),
    ])
      .then(([serviceResult, serviceList, branchResult, vehicleResult]) => {
        if (cancelled) return;
        const availableServices = serviceList.items.some(
          (item) => item.id === serviceResult.service.id,
        )
          ? serviceList.items
          : [serviceResult.service, ...serviceList.items];
        setServices(availableServices);
        setBranches(branchResult.branches);
        setVehicles(vehicleResult.vehicles);
        setSelectedServiceId(serviceResult.service.id);

        const [onlyBranch] = branchResult.branches;
        if (branchResult.branches.length === 1 && onlyBranch) {
          setBranchId(onlyBranch.id);
        }
        const preferredVehicle =
          vehicleResult.vehicles.find((vehicle) => vehicle.isPrimary) ??
          vehicleResult.vehicles[0];
        if (preferredVehicle) setVehicleId(preferredVehicle.id);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setLoadError(
            getErrorMessage(reason, "Could not load booking details."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [businessId, serviceId]);

  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );
  const selectedBranch = branches.find((branch) => branch.id === branchId);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);

  const calendar = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    return {
      label: new Date(year, month, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      today: toLocalIsoDate(today),
      days: [
        ...Array.from({ length: mondayOffset }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
      ],
      toValue: (day: number) => toLocalIsoDate(new Date(year, month, day)),
    };
  }, []);

  const canContinue =
    (step === 1 && Boolean(selectedService)) ||
    (step === 2 && Boolean(branchId)) ||
    (step === 3 && Boolean(vehicleId)) ||
    (step === 4 && Boolean(scheduledDate)) ||
    (step === 5 && Boolean(startTime)) ||
    (step >= 6 && step <= 8);

  async function handleConfirm() {
    if (!businessId || !selectedService) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const { booking } = await bookingsApi.create({
        businessId,
        serviceId: selectedService.id,
        branchId,
        vehicleId,
        scheduledDate,
        startTime,
        customerNotes: customerNotes || undefined,
      });
      setConfirmedBooking(booking);
    } catch (reason) {
      setSubmitError(getErrorMessage(reason, "Could not create this booking."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <p className="loading-block">Loading…</p>;

  if (loadError || !selectedService) {
    return (
      <EmptyState
        title="Could not load this service"
        description={loadError ?? undefined}
      />
    );
  }

  if (confirmedBooking) {
    return (
      <div className="booking-confirmation">
        <div className="booking-confirmation__check" aria-hidden="true">
          ✓
        </div>
        <h1>Booking Request Submitted!</h1>
        <p>
          Your requested appointment was saved. It will become confirmed after
          the shop accepts it.
        </p>
        <dl>
          <div className="booking-confirmation__reference">
            <dt>Request Reference</dt>
            <dd>{confirmedBooking.bookingNumber}</dd>
          </div>
          <div>
            <dt>Service</dt>
            <dd>{selectedService.name}</dd>
          </div>
          <div>
            <dt>Shop</dt>
            <dd>{selectedBranch?.name ?? "—"}</dd>
          </div>
          <div>
            <dt>Vehicle</dt>
            <dd>{vehicleName(selectedVehicle)}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{displayDate(scheduledDate, true)}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{TIME_SLOTS.find(([value]) => value === startTime)?.[1]}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>
              {Number(selectedService.basePrice)} {selectedService.currency}
            </dd>
          </div>
        </dl>
        <div className="booking-confirmation__actions">
          <Button variant="secondary" onClick={() => navigate("/bookings")}>
            View Bookings
          </Button>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-flow">
      <header className="booking-flow__title">
        <h1>Book a Service</h1>
        <span>Step {step} of 9</span>
      </header>
      <div className="booking-flow__progress" aria-hidden="true">
        <span style={{ width: `${(step / 9) * 100}%` }} />
      </div>
      <div className="booking-flow__labels" aria-label="Booking progress">
        {STEP_LABELS.map((label, index) => (
          <span
            className={
              index + 1 === step
                ? "is-active"
                : index + 1 < step
                  ? "is-complete"
                  : ""
            }
            key={label}
          >
            {label}
          </span>
        ))}
      </div>

      <section className="booking-flow__card">
        {step === 1 ? (
          <>
            <h2>Select a Service</h2>
            <p>Choose the service your vehicle needs</p>
            <div className="booking-options">
              {services.map((service) => (
                <label
                  className={`booking-option${selectedServiceId === service.id ? " booking-option--selected" : ""}`}
                  key={service.id}
                >
                  <input
                    type="radio"
                    name="service"
                    checked={selectedServiceId === service.id}
                    onChange={() => setSelectedServiceId(service.id)}
                  />
                  <span className="booking-option__content">
                    <strong>{service.name}</strong>
                    <small>{service.durationMinutes} min</small>
                  </span>
                  <strong className="booking-option__price">
                    {Number(service.basePrice) || "Free"}{" "}
                    {Number(service.basePrice) ? service.currency : ""}
                  </strong>
                </label>
              ))}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2>Choose a Shop</h2>
            <p>Select the location where you want your service</p>
            <div className="booking-options">
              {branches.length ? (
                branches.map((branch) => (
                  <label
                    className={`booking-option${branchId === branch.id ? " booking-option--selected" : ""}`}
                    key={branch.id}
                  >
                    <input
                      type="radio"
                      name="branch"
                      checked={branchId === branch.id}
                      onChange={() => setBranchId(branch.id)}
                    />
                    <span className="booking-option__content">
                      <strong>{branch.name}</strong>
                      <small>
                        {branch.addressLine1}, {branch.city}
                      </small>
                    </span>
                  </label>
                ))
              ) : (
                <EmptyState title="No shops available" />
              )}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h2>Select Your Vehicle</h2>
            <p>Choose which vehicle needs the service</p>
            <div className="booking-options">
              {vehicles.length ? (
                vehicles.map((vehicle) => (
                  <label
                    className={`booking-option${vehicleId === vehicle.id ? " booking-option--selected" : ""}`}
                    key={vehicle.id}
                  >
                    <input
                      type="radio"
                      name="vehicle"
                      checked={vehicleId === vehicle.id}
                      onChange={() => setVehicleId(vehicle.id)}
                    />
                    <span className="booking-option__content">
                      <strong>{vehicleName(vehicle)}</strong>
                      <small>
                        {vehicle.licensePlate ?? "No license plate"}
                      </small>
                    </span>
                  </label>
                ))
              ) : (
                <EmptyState
                  title="No vehicles on file"
                  description="Add a vehicle to continue booking."
                  action={<Link to="/cars">Add a vehicle</Link>}
                />
              )}
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <h2>Choose a Date</h2>
            <p>
              {selectedBranch?.name ?? "Shop"} — {calendar.label}
            </p>
            <div className="booking-calendar">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                <strong key={day}>{day}</strong>
              ))}
              {calendar.days.map((day, index) => {
                if (!day) return <span key={`blank-${index}`} />;
                const value = calendar.toValue(day);
                const isPast = value < calendar.today;
                return (
                  <button
                    type="button"
                    key={value}
                    disabled={isPast}
                    className={scheduledDate === value ? "is-selected" : ""}
                    onClick={() => setScheduledDate(value)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <h2>Choose a Time</h2>
            <p>Available slots for {displayDate(scheduledDate, true)}</p>
            <div className="booking-time-grid">
              {TIME_SLOTS.map(([value, label]) => (
                <button
                  type="button"
                  className={startTime === value ? "is-selected" : ""}
                  key={value}
                  onClick={() => setStartTime(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="booking-time-legend">
              <span>
                <i />
                Available
              </span>
              <span>
                <i className="is-selected" />
                Selected
              </span>
            </div>
          </>
        ) : null}

        {step === 6 ? (
          <>
            <h2>Describe the Issue</h2>
            <p>
              Help the mechanic understand what you need — optional but helpful
            </p>
            <textarea
              className="booking-notes"
              rows={5}
              maxLength={2000}
              placeholder="E.g. Engine warning light appeared last week. Car runs fine but I want it checked before a long trip."
              value={customerNotes}
              onChange={(event) => setCustomerNotes(event.target.value)}
            />
          </>
        ) : null}

        {step === 7 ? (
          <>
            <h2>Upload Photos</h2>
            <p>Add photos to help the shop understand the issue — optional</p>
            <label className="booking-photo-upload">
              <ImagePlus size={28} aria-hidden="true" />
              <strong>Click to upload photos</strong>
              <small>JPG or PNG, up to 5 images</small>
              <input
                type="file"
                accept="image/png,image/jpeg"
                multiple
                onChange={(event) =>
                  setPhotoNames(
                    Array.from(event.target.files ?? [])
                      .slice(0, 5)
                      .map((file) => file.name),
                  )
                }
              />
            </label>
            {photoNames.length ? (
              <ul className="booking-photo-list">
                {photoNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            ) : null}
            <small className="booking-local-note">
              Photos are preview-only until booking attachments are supported.
            </small>
          </>
        ) : null}

        {step === 8 ? (
          <>
            <h2>Review Your Booking</h2>
            <p>Make sure everything looks correct</p>
            <dl className="booking-review-list">
              <div>
                <dt>Service</dt>
                <dd>{selectedService.name}</dd>
              </div>
              <div>
                <dt>Shop</dt>
                <dd>{selectedBranch?.name}</dd>
              </div>
              <div>
                <dt>Vehicle</dt>
                <dd>{vehicleName(selectedVehicle)}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{displayDate(scheduledDate, true)}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>
                  {TIME_SLOTS.find(([value]) => value === startTime)?.[1]}
                </dd>
              </div>
              {customerNotes ? (
                <div>
                  <dt>Notes</dt>
                  <dd>{customerNotes}</dd>
                </div>
              ) : null}
              <div className="booking-review-list__total">
                <dt>Total</dt>
                <dd>
                  {Number(selectedService.basePrice)} {selectedService.currency}
                </dd>
              </div>
            </dl>
          </>
        ) : null}

        {step === 9 ? (
          <>
            <h2>Payment</h2>
            <p>Select your payment method</p>
            <div className="booking-payment-summary">
              <div>
                <span>Service cost</span>
                <strong>
                  {Number(selectedService.basePrice)} {selectedService.currency}
                </strong>
              </div>
              <div>
                <span>Platform fee</span>
                <strong className="is-free">
                  0 {selectedService.currency}
                </strong>
              </div>
              <div className="booking-payment-summary__total">
                <span>Total</span>
                <strong>
                  {Number(selectedService.basePrice)} {selectedService.currency}
                </strong>
              </div>
            </div>
            <div className="booking-payment-options">
              <div className="booking-payment-option booking-payment-option--selected">
                <i />
                <span>
                  <strong>Pay at Shop</strong>
                  <small>Cash or card on arrival</small>
                </span>
              </div>
              <div
                className="booking-payment-option booking-payment-option--disabled"
                aria-disabled="true"
              >
                <i />
                <span>
                  <strong>Pay Online</strong>
                  <small>Online payment is not configured</small>
                </span>
              </div>
            </div>
            {submitError ? (
              <p
                role="alert"
                className="ui-field__message ui-field__message--error"
              >
                {submitError}
              </p>
            ) : null}
          </>
        ) : null}
      </section>

      <div className="booking-flow__actions">
        {step > 1 ? (
          <Button
            variant="secondary"
            onClick={() => setStep((value) => value - 1)}
          >
            ← Back
          </Button>
        ) : (
          <span />
        )}
        {step < 9 ? (
          <Button
            disabled={!canContinue}
            onClick={() => setStep((value) => value + 1)}
          >
            Continue →
          </Button>
        ) : (
          <Button loading={isSubmitting} onClick={() => void handleConfirm()}>
            Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
}
