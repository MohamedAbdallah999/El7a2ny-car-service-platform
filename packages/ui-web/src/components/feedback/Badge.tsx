import type { HTMLAttributes } from "react";
import { classNames } from "../shared.js";

export type BadgeVariant =
  "default" | "success" | "warning" | "error" | "info" | "muted" | "dark";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={classNames("ui-badge", `ui-badge--${variant}`, className)}
    />
  );
}

const statusVariants: Record<string, BadgeVariant> = {
  upcoming: "info",
  confirmed: "success",
  scheduled: "info",
  "in progress": "warning",
  completed: "success",
  cancelled: "error",
  open: "success",
  closed: "muted",
  active: "success",
  suspended: "error",
  inactive: "muted",
  pending: "warning",
  preparing: "warning",
  shipped: "info",
  delivered: "success",
  accepted: "success",
  "in stock": "success",
  "low stock": "warning",
  "out of stock": "error",
  failed: "error",
  refunded: "info",
  investigating: "warning",
  resolved: "success",
  expired: "muted",
  high: "error",
  medium: "warning",
  low: "info",
  super_admin: "dark",
  admin: "info",
  customer: "default",
};

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: string;
}

export function StatusBadge({ status, children, ...props }: StatusBadgeProps) {
  const normalizedStatus = status.trim().toLowerCase().replace(/[-_]+/g, " ");
  const directVariant = statusVariants[status.trim().toLowerCase()];

  return (
    <Badge
      {...props}
      variant={directVariant ?? statusVariants[normalizedStatus] ?? "default"}
    >
      {children ?? status}
    </Badge>
  );
}
