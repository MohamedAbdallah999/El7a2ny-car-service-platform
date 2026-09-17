import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
}

export function Stat({ className, detail, label, value, ...props }: StatProps) {
  return (
    <div {...props} className={classNames("ui-stat", className)}>
      <strong className="ui-stat__value">{value}</strong>
      <span className="ui-stat__label">{label}</span>
      {detail ? <span className="ui-stat__detail">{detail}</span> : null}
    </div>
  );
}

export interface StatsGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
}

export function StatsGrid({
  className,
  columns = 4,
  ...props
}: StatsGridProps) {
  return (
    <div
      {...props}
      className={classNames(
        "ui-stats-grid",
        `ui-stats-grid--${columns}`,
        className,
      )}
    />
  );
}
