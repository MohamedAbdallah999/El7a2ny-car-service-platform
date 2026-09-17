import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";

export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div {...props} className={classNames("ui-empty-state", className)}>
      {icon ? (
        <span className="ui-empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h3 className="ui-empty-state__title">{title}</h3>
      {description ? (
        <p className="ui-empty-state__description">{description}</p>
      ) : null}
      {action ? <div className="ui-empty-state__action">{action}</div> : null}
    </div>
  );
}

export interface SuccessStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title: ReactNode;
  description?: ReactNode;
  details?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
}

export function SuccessState({
  actions,
  className,
  description,
  details,
  icon = "✓",
  title,
  ...props
}: SuccessStateProps) {
  return (
    <div
      {...props}
      role="status"
      className={classNames("ui-success-state", className)}
    >
      <span className="ui-success-state__icon" aria-hidden="true">
        {icon}
      </span>
      <h2 className="ui-success-state__title">{title}</h2>
      {description ? (
        <p className="ui-success-state__description">{description}</p>
      ) : null}
      {details ? (
        <div className="ui-success-state__details">{details}</div>
      ) : null}
      {actions ? (
        <div className="ui-success-state__actions">{actions}</div>
      ) : null}
    </div>
  );
}
