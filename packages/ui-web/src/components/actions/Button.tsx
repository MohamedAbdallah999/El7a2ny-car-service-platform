import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";

export type ButtonVariant =
  "primary" | "secondary" | "ghost" | "dark" | "outline" | "destructive";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      disabled,
      endIcon,
      fullWidth = false,
      loading = false,
      size = "md",
      startIcon,
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={classNames(
          "ui-button",
          `ui-button--${variant}`,
          `ui-button--${size}`,
          fullWidth && "ui-button--full-width",
          loading && "ui-button--loading",
          className,
        )}
      >
        {startIcon ? (
          <span className="ui-button__icon" aria-hidden="true">
            {startIcon}
          </span>
        ) : null}
        <span>{loading ? "Loading…" : children}</span>
        {endIcon ? (
          <span className="ui-button__icon" aria-hidden="true">
            {endIcon}
          </span>
        ) : null}
      </button>
    );
  },
);
