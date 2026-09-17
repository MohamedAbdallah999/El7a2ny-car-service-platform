import { forwardRef, useId } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { classNames } from "../shared.js";
import { Field } from "./Field.js";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      children,
      className,
      error,
      fullWidth = true,
      hint,
      id,
      label,
      required,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const messageId = `${selectId}-message`;

    return (
      <Field
        label={label}
        htmlFor={selectId}
        hint={hint}
        error={error}
        required={required}
        messageId={error || hint ? messageId : undefined}
        className={fullWidth ? "ui-field--full-width" : undefined}
      >
        <select
          {...props}
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={classNames(
            "ui-select",
            Boolean(error) && "ui-select--error",
            className,
          )}
        >
          {children}
        </select>
      </Field>
    );
  },
);
