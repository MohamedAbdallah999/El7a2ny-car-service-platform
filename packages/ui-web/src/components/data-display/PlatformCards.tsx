import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";
import { StarRating } from "./Rating.js";

export interface ShopCardProps extends HTMLAttributes<HTMLElement> {
  name: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  distance?: ReactNode;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  action?: ReactNode;
  compact?: boolean;
}

export function ShopCard({
  action,
  className,
  compact,
  distance,
  imageAlt = "",
  imageSrc,
  name,
  rating,
  reviewCount,
  verified,
  ...props
}: ShopCardProps) {
  return (
    <article
      {...props}
      className={classNames(
        "ui-shop-card",
        compact && "ui-shop-card--compact",
        className,
      )}
    >
      {imageSrc ? (
        <img className="ui-shop-card__image" src={imageSrc} alt={imageAlt} />
      ) : null}
      <div className="ui-shop-card__content">
        {verified ? (
          <span className="ui-shop-card__verified">✓ Verified</span>
        ) : null}
        <h3 className="ui-shop-card__name">{name}</h3>
        <div className="ui-shop-card__meta">
          {rating === undefined ? null : (
            <StarRating value={rating} reviewCount={reviewCount} max={5} />
          )}
          {distance ? <span>{distance}</span> : null}
        </div>
        {action ? <div className="ui-shop-card__action">{action}</div> : null}
      </div>
    </article>
  );
}

export interface VehicleCardProps extends HTMLAttributes<HTMLElement> {
  make: ReactNode;
  model?: ReactNode;
  year?: ReactNode;
  metadata?: ReactNode;
  action?: ReactNode;
  variant?: "light" | "dark";
}

export function VehicleCard({
  action,
  className,
  make,
  metadata,
  model,
  variant = "light",
  year,
  ...props
}: VehicleCardProps) {
  return (
    <article
      {...props}
      className={classNames(
        "ui-vehicle-card",
        `ui-vehicle-card--${variant}`,
        className,
      )}
    >
      <div>
        <p className="ui-vehicle-card__label">My Vehicle</p>
        <h3 className="ui-vehicle-card__title">
          {make} {model}
        </h3>
        {year ? <p className="ui-vehicle-card__year">{year}</p> : null}
        {metadata ? <p className="ui-vehicle-card__meta">{metadata}</p> : null}
      </div>
      {action ? <div className="ui-vehicle-card__action">{action}</div> : null}
    </article>
  );
}

export interface AppointmentBarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  title: ReactNode;
  schedule: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  statusIndicator?: boolean;
}

export function AppointmentBar({
  action,
  className,
  eyebrow = "Upcoming Appointment",
  schedule,
  statusIndicator = true,
  title,
  ...props
}: AppointmentBarProps) {
  return (
    <aside {...props} className={classNames("ui-appointment-bar", className)}>
      {statusIndicator ? (
        <span className="ui-appointment-bar__status" aria-hidden="true" />
      ) : null}
      <div className="ui-appointment-bar__content">
        <span className="ui-appointment-bar__eyebrow">{eyebrow}</span>
        <strong>{title}</strong>
        <span className="ui-appointment-bar__schedule">{schedule}</span>
      </div>
      {action ? (
        <div className="ui-appointment-bar__action">{action}</div>
      ) : null}
    </aside>
  );
}
