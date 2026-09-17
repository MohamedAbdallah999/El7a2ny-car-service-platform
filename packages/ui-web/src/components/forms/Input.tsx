import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";
import { Field } from "./Field.js";

export type InputState = "default" | "error" | "success";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  state?: InputState;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    endAdornment,
    error,
    fullWidth = true,
    hint,
    id,
    label,
    required,
    showPasswordToggle = false,
    startAdornment,
    state = "default",
    type = "text",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const isInvalid = Boolean(error) || state === "error";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const canTogglePassword = showPasswordToggle && type === "password";

  return (
    <Field
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={error}
      required={required}
      messageId={error || hint ? messageId : undefined}
      className={fullWidth ? "ui-field--full-width" : undefined}
    >
      <span
        className={classNames(
          "ui-input-wrap",
          `ui-input-wrap--${isInvalid ? "error" : state}`,
          props.disabled && "ui-input-wrap--disabled",
        )}
      >
        {startAdornment ? (
          <span className="ui-input__adornment" aria-hidden="true">
            {startAdornment}
          </span>
        ) : null}
        <input
          {...props}
          ref={ref}
          id={inputId}
          type={canTogglePassword && passwordVisible ? "text" : type}
          required={required}
          aria-invalid={isInvalid || undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={classNames("ui-input", className)}
        />
        {canTogglePassword ? (
          <button
            type="button"
            className="ui-input__toggle"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            aria-pressed={passwordVisible}
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            {passwordVisible ? "Hide" : "Show"}
          </button>
        ) : endAdornment ? (
          <span className="ui-input__adornment" aria-hidden="true">
            {endAdornment}
          </span>
        ) : null}
      </span>
    </Field>
  );
});
