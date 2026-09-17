import { forwardRef } from "react";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";

export interface SearchBarProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  onSearch?: (value: string) => void;
  buttonLabel?: string;
  icon?: ReactNode;
  variant?: "inline" | "hero";
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar(
    {
      buttonLabel = "Search",
      className,
      icon,
      onSearch,
      variant = "inline",
      ...props
    },
    ref,
  ) {
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      onSearch?.(String(formData.get("search") ?? ""));
    }

    return (
      <form
        role="search"
        className={classNames("ui-search", `ui-search--${variant}`, className)}
        onSubmit={handleSubmit}
      >
        {icon ? (
          <span className="ui-search__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <input
          {...props}
          ref={ref}
          type="search"
          name="search"
          aria-label={props["aria-label"] ?? props.placeholder ?? "Search"}
          className="ui-search__input"
        />
        {variant === "hero" ? (
          <button type="submit" className="ui-search__button">
            {buttonLabel}
          </button>
        ) : null}
      </form>
    );
  },
);
