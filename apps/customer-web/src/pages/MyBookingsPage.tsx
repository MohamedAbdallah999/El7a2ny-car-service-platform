import type { Booking } from "@car-platform/types";
import { Button, EmptyState, Input, Select, Tabs } from "@car-platform/ui-web";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingsApi, reviewsApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

type BookingTab = "upcoming" | "active" | "completed" | "cancelled";
const TAB_STATUSES: Record<BookingTab, string[]> = {
  upcoming: ["PENDING", "CONFIRMED"],
  active: ["IN_PROGRESS"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED", "REJECTED", "NO_SHOW"],
};

export function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<BookingTab>("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<Booking | null>(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  function fetchBookings() {
    return bookingsApi
      .listMine({ limit: 40 })
      .then((result) => setBookings(result.items))
      .catch((reason: unknown) =>
        setError(getErrorMessage(reason, "Could not load your bookings.")),
      )
      .finally(() => setIsLoading(false));
  }
  useEffect(() => {
    void fetchBookings();
  }, []);
  const visibleBookings = useMemo(
    () =>
      bookings.filter((booking) => TAB_STATUSES[tab].includes(booking.status)),
    [bookings, tab],
  );

  async function handleCancel(bookingId: string) {
    setCancellingId(bookingId);
    try {
      await bookingsApi.updateStatus(bookingId, {
        status: "CANCELLED",
        reason: "Cancelled by customer",
      });
      await fetchBookings();
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not cancel this booking."));
    } finally {
      setCancellingId(null);
    }
  }

  async function submitReview() {
    if (!reviewing) return;
    setIsReviewing(true);
    try {
      await reviewsApi.createBusinessReview({
        businessId: reviewing.businessId,
        bookingId: reviewing.id,
        rating: Number(rating),
        comment: comment || undefined,
      });
      setReviewing(null);
      setComment("");
      setRating("5");
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not submit your review."));
    } finally {
      setIsReviewing(false);
    }
  }

  function statusLabel(currentTab: BookingTab, booking: Booking) {
    if (booking.status === "PENDING") return "Pending approval";
    return currentTab === "upcoming"
      ? "Upcoming"
      : currentTab[0]?.toUpperCase() + currentTab.slice(1);
  }

  return (
    <div className="customer-page bookings-page">
      <header className="customer-page__heading">
        <h1>My Bookings</h1>
      </header>
      <Tabs
        label="Booking status"
        variant="underline"
        value={tab}
        onValueChange={setTab}
        items={[
          { value: "upcoming", label: "Upcoming" },
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ]}
      />
      {error ? (
        <p role="alert" className="ui-field__message ui-field__message--error">
          {error}
        </p>
      ) : null}
      {isLoading ? (
        <p className="loading-block">Loading…</p>
      ) : visibleBookings.length === 0 ? (
        <EmptyState title={`No ${tab} bookings`} />
      ) : (
        <div className="booking-list">
          {visibleBookings.map((booking) => (
            <article className="booking-card" key={booking.id}>
              <div className="booking-card__summary">
                <div>
                  <div className="booking-card__reference">
                    <span>{booking.bookingNumber}</span>
                    <span className={`booking-status booking-status--${tab}`}>
                      {statusLabel(tab, booking)}
                    </span>
                  </div>
                  <h2>{booking.service?.name ?? "Service"}</h2>
                  <p>{booking.business?.name}</p>
                </div>
                <strong>
                  {Number(booking.finalPrice ?? booking.estimatedPrice)}{" "}
                  {booking.currency}
                </strong>
              </div>
              <div className="booking-card__details">
                <div>
                  <small>Vehicle</small>
                  <strong>
                    {booking.vehicle
                      ? `${booking.vehicle.make?.name ?? ""} ${booking.vehicle.model?.name ?? ""} ${booking.vehicle.year}`
                      : "Vehicle"}
                  </strong>
                </div>
                <div>
                  <small>Date &amp; Time</small>
                  <strong>
                    {new Date(booking.scheduledDate).toLocaleDateString(
                      undefined,
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}{" "}
                    · {booking.startTime.slice(11, 16)}
                  </strong>
                </div>
                <div>
                  <small>Location</small>
                  <strong>
                    {booking.branch?.addressLine1 ??
                      booking.branch?.name ??
                      "Shop location"}
                  </strong>
                </div>
              </div>
              {tab === "upcoming" ? (
                <div className="booking-card__actions">
                  {booking.branch?.phone ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        window.location.href = `tel:${booking.branch?.phone ?? ""}`;
                      }}
                    >
                      Contact Shop
                    </Button>
                  ) : null}
                  <Button
                    variant="destructive"
                    size="sm"
                    loading={cancellingId === booking.id}
                    onClick={() => void handleCancel(booking.id)}
                  >
                    Cancel Booking
                  </Button>
                </div>
              ) : null}
              {tab === "completed" ? (
                <div className="booking-card__actions">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setReviewing(booking)}
                  >
                    Leave a Review
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate(
                        `/book/${booking.businessId}/${booking.serviceId}`,
                      )
                    }
                  >
                    Book Again
                  </Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
      {reviewing ? (
        <div className="booking-review">
          <h2>Review {reviewing.business?.name}</h2>
          <Select
            label="Rating"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} stars
              </option>
            ))}
          </Select>
          <Input
            label="Comment (optional)"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <div>
            <Button variant="secondary" onClick={() => setReviewing(null)}>
              Cancel
            </Button>
            <Button loading={isReviewing} onClick={() => void submitReview()}>
              Submit Review
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
