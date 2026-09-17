import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  messageId?: string;
}

export function Field({
  children,
  className,
  error,
  hint,
  htmlFor,
  label,
  messageId,
  required,
  ...props
}: FieldProps) {
  return (
    <div {...props} className={classNames("ui-field", className)}>
      {label ? (
        <label className="ui-field__label" htmlFor={htmlFor}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span
          id={messageId}
          className="ui-field__message ui-field__message--error"
        >
          {error}
        </span>
      ) : hint ? (
        <span id={messageId} className="ui-field__message">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
