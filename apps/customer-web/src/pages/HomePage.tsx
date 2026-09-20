import type {
  BusinessSummary,
  Booking,
  ServiceCategory,
  ServiceSummary,
  Vehicle,
} from "@car-platform/types";
import { Button, EmptyState, SearchBar, ShopCard } from "@car-platform/ui-web";
import {
  BatteryCharging,
  CarFront,
  CircleGauge,
  Clock3,
  Disc3,
  Snowflake,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bookingsApi,
  businessesApi,
  servicesApi,
  vehiclesApi,
} from "../lib/api";
import { getErrorMessage } from "../lib/error";

const CATEGORY_ICONS = [
  Wrench,
  Disc3,
  CarFront,
  BatteryCharging,
  Snowflake,
  CircleGauge,
];

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hrs`;
}

function getBookingTime(booking: Booking) {
  return new Date(
    `${booking.scheduledDate.slice(0, 10)}T${booking.startTime.slice(0, 8)}`,
  ).getTime();
}

export function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [appointment, setAppointment] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      servicesApi.listCategories(),
      businessesApi.list({ limit: 4 }),
      servicesApi.list({ limit: 4 }),
      vehiclesApi.listMine(),
      bookingsApi.listMine({ limit: 40 }),
    ])
      .then(
        ([
          categoryResult,
          businessResult,
          serviceResult,
          vehicleResult,
          bookingResult,
        ]) => {
          if (cancelled) return;
          setCategories(categoryResult.categories);
          setBusinesses(businessResult.items);
          setServices(serviceResult.items);
          setVehicle(
            vehicleResult.vehicles.find((item) => item.isPrimary) ??
              vehicleResult.vehicles[0] ??
              null,
          );
          setAppointment(
            bookingResult.items
              .filter((booking) =>
                ["PENDING", "CONFIRMED"].includes(booking.status),
              )
              .filter((booking) => getBookingTime(booking) >= Date.now())
              .sort(
                (first, second) =>
                  getBookingTime(first) - getBookingTime(second),
              )[0] ?? null,
          );
        },
      )
      .catch((reason: unknown) => {
        if (!cancelled)
          setError(getErrorMessage(reason, "Could not load the homepage."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="customer-page home-page">
      <div className="home-dark-section">
        <section className="home-hero ui-container">
          <div className="home-hero__copy">
            <span className="customer-kicker">
              Egypt&apos;s Automotive Services Platform
            </span>
            <h1>
              Your car deserves
              <br />
              the best care.
            </h1>
            <p>
              Book services, request repairs, and find genuine parts from top
              automotive shops near you.
            </p>
            <SearchBar
              variant="hero"
              placeholder="Search services, shops, or parts..."
              onSearch={(value) =>
                navigate(`/services?search=${encodeURIComponent(value)}`)
              }
            />
          </div>
          {vehicle ? (
            <article className="home-vehicle-card">
              <div className="home-vehicle-card__image">
                {vehicle.imageUrl ? (
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.make?.name ?? ""} ${vehicle.model?.name ?? ""}`}
                  />
                ) : (
                  <CarFront size={56} />
                )}
              </div>
              <div className="home-vehicle-card__body">
                <div className="home-vehicle-card__title">
                  <h2>
                    {vehicle.make?.name} {vehicle.model?.name}
                  </h2>
                  <span>{vehicle.year}</span>
                </div>
                <p>
                  {[
                    vehicle.licensePlate,
                    vehicle.mileage
                      ? `${vehicle.mileage.toLocaleString()} km`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="home-vehicle-card__actions">
                  <Button onClick={() => navigate("/services")}>
                    Book Service
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/cars")}>
                    My Cars
                  </Button>
                </div>
              </div>
            </article>
          ) : null}
        </section>
        <aside className="home-appointment">
          <div className="ui-container home-appointment__inner">
            <span className="home-appointment__status" />
            {appointment ? (
              <>
                <div>
                  <small>Upcoming Appointment</small>
                  <strong>
                    {appointment.service?.name ?? "Service"} ·{" "}
                    <span>{appointment.business?.name}</span>
                  </strong>
                </div>
                <time>
                  {new Date(appointment.scheduledDate).toLocaleDateString()} at{" "}
                  {appointment.startTime}
                </time>
                <Button size="sm" onClick={() => navigate("/bookings")}>
                  View Booking
                </Button>
              </>
            ) : (
              <>
                <div>
                  <small>Upcoming Appointment</small>
                  <strong>No upcoming services scheduled</strong>
                </div>
                <Button size="sm" onClick={() => navigate("/services")}>
                  Book a Service
                </Button>
              </>
            )}
          </div>
        </aside>
      </div>
      {error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : null}
      {categories.length ? (
        <section className="category-strip" aria-label="Service categories">
          {categories.slice(0, 8).map((category, index) => {
            const Icon =
              CATEGORY_ICONS[index % CATEGORY_ICONS.length] ?? Wrench;
            return (
              <button
                key={category.id}
                onClick={() => navigate(`/services?categoryId=${category.id}`)}
              >
                <span>
                  <Icon size={21} />
                </span>
                {category.name}
              </button>
            );
          })}
        </section>
      ) : null}
      <section>
        <div className="section-heading">
          <h2>Shops Near You</h2>
          <button onClick={() => navigate("/shops")}>View all</button>
        </div>
        {isLoading ? (
          <p className="loading-block">Loading shops…</p>
        ) : businesses.length === 0 ? (
          <EmptyState title="No shops yet" />
        ) : (
          <div className="page-grid page-grid--4col">
            {businesses.map((business) => (
              <ShopCard
                key={business.id}
                name={business.name}
                imageSrc={business.coverImageUrl ?? undefined}
                rating={Number(business.averageRating)}
                reviewCount={business.totalReviews}
                verified={false}
                distance={business.branches?.[0]?.city}
                onClick={() => navigate(`/shops/${business.slug}`)}
              />
            ))}
          </div>
        )}
      </section>
      {services.length ? (
        <section>
          <div className="section-heading">
            <h2>Popular Services</h2>
            <button onClick={() => navigate("/services")}>View all</button>
          </div>
          <div className="home-service-grid">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() =>
                  navigate(`/book/${service.businessId}/${service.id}`)
                }
              >
                <span className="customer-kicker">
                  {categories.find(
                    (category) => category.id === service.categoryId,
                  )?.name ?? "Automotive Service"}
                </span>
                <strong>{service.name}</strong>
                <small>
                  <Clock3 size={10} /> {formatDuration(service.durationMinutes)}
                </small>
                <b>
                  {Number(service.basePrice) === 0
                    ? "Free"
                    : `${Number(service.basePrice)} ${service.currency}`}
                </b>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
