import type { HTMLAttributes, MouseEventHandler } from "react";
import { classNames } from "../shared.js";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  selected?: boolean;
  compatible?: boolean;
  onActivate?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export function Chip({
  children,
  className,
  compatible,
  disabled,
  onActivate,
  selected,
  ...props
}: ChipProps) {
  const chipClassName = classNames(
    "ui-chip",
    selected && "ui-chip--selected",
    compatible && "ui-chip--compatible",
    className,
  );

  if (onActivate) {
    return (
      <button
        type="button"
        className={chipClassName}
        aria-pressed={selected}
        disabled={disabled}
        onClick={onActivate}
      >
        {compatible ? <span aria-hidden="true">✓ </span> : null}
        {children}
      </button>
    );
  }

  return (
    <span {...props} className={chipClassName}>
      {compatible ? <span aria-hidden="true">✓ </span> : null}
      {children}
    </span>
  );
}
