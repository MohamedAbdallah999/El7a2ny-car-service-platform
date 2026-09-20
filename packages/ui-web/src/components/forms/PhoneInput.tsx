import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { Field } from "./Field.js";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const countryOptions = getCountries()
  .map((country) => ({
    country,
    name: regionNames.of(country) ?? country,
    callingCode: getCountryCallingCode(country),
  }))
  .sort((first, second) => first.name.localeCompare(second.name));

function stateFromValue(value: string, fallbackCountry: CountryCode) {
  const parsed = value ? parsePhoneNumberFromString(value) : undefined;
  const country = parsed?.country ?? fallbackCountry;
  return {
    country,
    nationalNumber: parsed?.formatNational() ?? "",
  };
}

export interface PhoneInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type" | "value"
> {
  value: string;
  onValueChange: (value: string) => void;
  defaultCountry?: CountryCode;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export function PhoneInput({
  autoComplete = "tel-national",
  defaultCountry = "EG",
  disabled,
  error,
  hint = "Choose a country, then enter your phone number without the country code.",
  id,
  label = "Phone number",
  name,
  onBlur,
  onValueChange,
  placeholder = "100 123 4567",
  required,
  value,
  ...inputProps
}: PhoneInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const initial = stateFromValue(value, defaultCountry);
  const [country, setCountry] = useState<CountryCode>(initial.country);
  const [nationalNumber, setNationalNumber] = useState(initial.nationalNumber);
  const [search, setSearch] = useState("");
  const [touched, setTouched] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastEmittedValue = useRef(value);

  const selectedOption =
    countryOptions.find((option) => option.country === country) ??
    countryOptions[0]!;
  const isValid = Boolean(value) && isValidPhoneNumber(value);
  const localError =
    touched && nationalNumber && !isValid
      ? `Enter a valid phone number for ${selectedOption.name}.`
      : undefined;
  const displayedError = error ?? localError;

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return countryOptions;
    return countryOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(query) ||
        option.country.toLowerCase().includes(query) ||
        `+${option.callingCode}`.includes(query),
    );
  }, [search]);

  useEffect(() => {
    if (value === lastEmittedValue.current) return;
    const next = stateFromValue(value, defaultCountry);
    setCountry(next.country);
    setNationalNumber(next.nationalNumber);
  }, [defaultCountry, value]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.setCustomValidity(
      nationalNumber && !isValid ? "Enter a valid phone number." : "",
    );
  }, [isValid, nationalNumber]);

  useEffect(() => {
    function closeCountryMenu(event: PointerEvent) {
      if (!detailsRef.current?.contains(event.target as Node)) {
        detailsRef.current?.removeAttribute("open");
      }
    }
    document.addEventListener("pointerdown", closeCountryMenu);
    return () => document.removeEventListener("pointerdown", closeCountryMenu);
  }, []);

  function emitNumber(nextNationalNumber: string, nextCountry: CountryCode) {
    const digits = nextNationalNumber.replace(/\D/g, "");
    if (!digits) {
      lastEmittedValue.current = "";
      onValueChange("");
      return;
    }

    const formatter = new AsYouType(nextCountry);
    formatter.input(digits);
    const e164 =
      formatter.getNumberValue() ??
      `+${getCountryCallingCode(nextCountry)}${digits}`;
    lastEmittedValue.current = e164;
    onValueChange(e164);
  }

  function handleNumberChange(event: ChangeEvent<HTMLInputElement>) {
    const rawValue = event.target.value;
    const formatter = new AsYouType(country);
    const formatted = formatter.input(rawValue.replace(/\D/g, ""));
    setNationalNumber(formatted);
    emitNumber(formatted, country);
  }

  function handleCountryChange(nextCountry: CountryCode) {
    setCountry(nextCountry);
    setSearch("");
    setTouched(false);
    const digits = nationalNumber.replace(/\D/g, "");
    const formatter = new AsYouType(nextCountry);
    const formatted = formatter.input(digits);
    setNationalNumber(formatted);
    emitNumber(formatted, nextCountry);
    detailsRef.current?.removeAttribute("open");
    inputRef.current?.focus();
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setTouched(true);
    onBlur?.(event);
  }

  return (
    <Field
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={displayedError}
      required={required}
      messageId={displayedError || hint ? messageId : undefined}
      className="ui-field--full-width"
    >
      <div
        className={`ui-phone${displayedError ? " ui-phone--error" : ""}${disabled ? " ui-phone--disabled" : ""}`}
      >
        <details ref={detailsRef} className="ui-phone__country">
          <summary
            aria-label={`Country: ${selectedOption.name}, calling code +${selectedOption.callingCode}`}
          >
            <span
              className={`ui-phone__flag flag:${country}`}
              aria-hidden="true"
            />
            <span>+{selectedOption.callingCode}</span>
            <span className="ui-phone__chevron" aria-hidden="true">
              ▾
            </span>
          </summary>
          <div className="ui-phone__menu">
            <input
              type="search"
              className="ui-phone__search"
              aria-label="Search countries"
              placeholder="Search country or code"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="ui-phone__options" role="listbox">
              {filteredOptions.map((option) => {
                return (
                  <button
                    key={option.country}
                    type="button"
                    role="option"
                    aria-selected={country === option.country}
                    className={
                      country === option.country
                        ? "ui-phone__option ui-phone__option--selected"
                        : "ui-phone__option"
                    }
                    onClick={() => handleCountryChange(option.country)}
                  >
                    <span
                      className={`ui-phone__flag flag:${option.country}`}
                      aria-hidden="true"
                    />
                    <span>{option.name}</span>
                    <strong>+{option.callingCode}</strong>
                  </button>
                );
              })}
            </div>
          </div>
        </details>
        <input
          {...inputProps}
          ref={inputRef}
          id={inputId}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          value={nationalNumber}
          aria-invalid={Boolean(displayedError) || undefined}
          aria-describedby={displayedError || hint ? messageId : undefined}
          className="ui-phone__input"
          onChange={handleNumberChange}
          onBlur={handleBlur}
        />
      </div>
    </Field>
  );
}
