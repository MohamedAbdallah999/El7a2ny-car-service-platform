import type { HTMLAttributes } from "react";
import { classNames } from "../shared.js";

export interface StarsProps extends HTMLAttributes<HTMLSpanElement> {
  value: number;
  max?: number;
  showValue?: boolean;
}

export function Stars({
  className,
  max = 5,
  showValue = true,
  value,
  ...props
}: StarsProps) {
  const normalizedValue = Math.max(0, Math.min(value, max));
  const roundedValue = Math.round(normalizedValue);

  return (
    <span
      {...props}
      role="img"
      aria-label={`${normalizedValue} out of ${max} stars`}
      className={classNames("ui-stars", className)}
    >
      <span aria-hidden="true">
        {Array.from({ length: max }, (_, index) => (
          <span
            key={index}
            className={classNames(
              "ui-stars__star",
              index >= roundedValue && "ui-stars__star--empty",
            )}
          >
            ★
          </span>
        ))}
      </span>
      {showValue ? (
        <span className="ui-stars__value">{value.toFixed(1)}</span>
      ) : null}
    </span>
  );
}

export interface StarRatingProps extends StarsProps {
  reviewCount?: number;
}

export function StarRating({ reviewCount, ...props }: StarRatingProps) {
  return (
    <span className="ui-star-rating">
      <Stars {...props} />
      {reviewCount === undefined ? null : (
        <span className="ui-star-rating__count">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </span>
  );
}
