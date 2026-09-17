import type { BusinessSummary, ServiceSummary } from "@car-platform/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  StarRating,
} from "@car-platform/ui-web";
import type { BusinessReview } from "@car-platform/api-client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { businessesApi, reviewsApi, servicesApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";

export function ShopDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessSummary | null>(null);
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    businessesApi
      .getBySlug(slug)
      .then(async ({ business: found }) => {
        if (cancelled) return;
        setBusiness(found);
        setError(null);
        const [serviceResult, reviewResult] = await Promise.all([
          servicesApi.list({ businessId: found.id, limit: 40 }),
          reviewsApi.listForBusiness(found.id, { limit: 10 }),
        ]);
        if (cancelled) return;
        setServices(serviceResult.items);
        setReviews(reviewResult.items);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Shop not found."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return <p className="loading-block">Loading shop…</p>;
  }

  if (error || !business) {
    return (
      <EmptyState
        title="Shop not found"
        description={error ?? "This shop is not available."}
      />
    );
  }

  return (
    <div className="form-stack" style={{ gap: "2rem" }}>
      <section>
        {business.coverImageUrl ? (
          <img
            src={business.coverImageUrl}
            alt=""
            style={{
              width: "100%",
              maxHeight: "16rem",
              objectFit: "cover",
              borderRadius: "var(--radius-lg)",
            }}
          />
        ) : null}
        <div className="spread-row" style={{ marginTop: "1rem" }}>
          <div>
            <h1>{business.name}</h1>
            <div className="inline-actions" style={{ marginTop: "0.5rem" }}>
              <StarRating value={Number(business.averageRating)} reviewCount={business.totalReviews} />
              {business.verificationStatus === "VERIFIED" ? (
                <Badge variant="success">Verified</Badge>
              ) : null}
            </div>
          </div>
        </div>
        {business.branches?.[0] ? (
          <p className="muted-text" style={{ marginTop: "0.5rem" }}>
            {business.branches[0].addressLine1}, {business.branches[0].city}
          </p>
        ) : null}
      </section>

      <section>
        <h3 style={{ marginBottom: "1rem" }}>Services</h3>
        {services.length === 0 ? (
          <EmptyState title="No services listed yet" />
        ) : (
          <div className="form-stack">
            {services.map((service) => (
              <Card key={service.id} className="spread-row">
                <div>
                  <strong>{service.name}</strong>
                  <p className="muted-text">
                    {service.durationMinutes} min · {service.basePrice}{" "}
                    {service.currency}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={!service.isOnlineBooking}
                  onClick={() =>
                    navigate(`/book/${business.id}/${service.id}`)
                  }
                >
                  Book
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 style={{ marginBottom: "1rem" }}>Reviews</h3>
        {reviews.length === 0 ? (
          <EmptyState title="No reviews yet" />
        ) : (
          <div className="form-stack">
            {reviews.map((review) => (
              <Card key={review.id}>
                <div className="spread-row">
                  <strong>
                    {review.customer.user.firstName}{" "}
                    {review.customer.user.lastName}
                  </strong>
                  <StarRating value={review.rating} showValue={false} />
                </div>
                {review.comment ? (
                  <p style={{ marginTop: "0.5rem" }}>{review.comment}</p>
                ) : null}
                {review.adminReply ? (
                  <p className="muted-text" style={{ marginTop: "0.5rem" }}>
                    Business reply: {review.adminReply}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
