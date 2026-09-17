import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";

export type AlertVariant = "success" | "warning" | "error" | "info";

export interface AlertProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  variant?: AlertVariant;
  title?: ReactNode;
  icon?: ReactNode;
}

export function Alert({
  children,
  className,
  icon,
  title,
  variant = "info",
  ...props
}: AlertProps) {
  return (
    <div
      {...props}
      role={variant === "error" ? "alert" : "status"}
      className={classNames("ui-alert", `ui-alert--${variant}`, className)}
    >
      {icon ? (
        <span className="ui-alert__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div>
        {title ? <strong className="ui-alert__title">{title}</strong> : null}
        <div className="ui-alert__content">{children}</div>
      </div>
    </div>
  );
}
