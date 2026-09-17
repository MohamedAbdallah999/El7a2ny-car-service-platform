import type { Booking } from "@car-platform/types";
import { Button, Card, EmptyState, PageHeader, StatusBadge } from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import { bookingsApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED"];

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  function fetchBookings() {
    return bookingsApi
      .listMine({ limit: 40 })
      .then((result) => setBookings(result.items))
      .catch((err) => setError(getErrorMessage(err, "Could not load your bookings.")))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  // Reload after cancelling: called from an event handler, so setting
  // isLoading synchronously here is fine.
  function reload() {
    setIsLoading(true);
    fetchBookings();
  }

  async function handleCancel(bookingId: string) {
    setCancellingId(bookingId);
    try {
      await bookingsApi.updateStatus(bookingId, {
        status: "CANCELLED",
        reason: "Cancelled by customer",
      });
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not cancel this booking."));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="form-stack" style={{ gap: "1.5rem" }}>
      <PageHeader title="My Bookings" />

      {isLoading ? (
        <p className="loading-block">Loading…</p>
      ) : error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings yet" />
      ) : (
        <div className="form-stack">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <div className="spread-row">
                <div>
                  <strong>{booking.service?.name ?? "Service"}</strong>
                  <p className="muted-text">
                    {booking.business?.name} · {booking.scheduledDate}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              {CANCELLABLE_STATUSES.includes(booking.status) ? (
                <div style={{ marginTop: "0.75rem" }}>
                  <Button
                    size="sm"
                    variant="destructive"
                    loading={cancellingId === booking.id}
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel booking
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
