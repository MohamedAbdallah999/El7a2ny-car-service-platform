import { useRef } from "react";
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react";
import { classNames } from "../shared.js";

const OTP_LENGTH = 6;

export interface OtpInputProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

export function OtpInput({
  className,
  disabled,
  invalid,
  label = "Verification code",
  onValueChange,
  value,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from(
    { length: OTP_LENGTH },
    (_, index) => value[index] ?? "",
  );

  function updateDigit(index: number, nextDigit: string) {
    const normalizedDigit = nextDigit.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = normalizedDigit;
    onValueChange(nextDigits.join(""));
    if (normalizedDigit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    onValueChange(pastedValue);
    inputRefs.current[Math.min(pastedValue.length, OTP_LENGTH - 1)]?.focus();
  }

  return (
    <fieldset
      className={classNames("ui-otp", className)}
      disabled={disabled}
      aria-invalid={invalid || undefined}
    >
      <legend className="ui-field__label">{label}</legend>
      <div className="ui-otp__inputs" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            className={classNames(
              "ui-otp__input",
              invalid && "ui-otp__input--error",
            )}
            value={digit}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`${label} digit ${index + 1}`}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateDigit(index, event.target.value)
            }
            onKeyDown={(event) => handleKeyDown(index, event)}
          />
        ))}
      </div>
    </fieldset>
  );
}
