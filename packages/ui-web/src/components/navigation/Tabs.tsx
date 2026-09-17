import { useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { classNames } from "../shared.js";

export interface TabItem<Value extends string = string> {
  value: Value;
  label: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<Value extends string = string> {
  items: ReadonlyArray<TabItem<Value>>;
  value: Value;
  onValueChange: (value: Value) => void;
  variant?: "pill" | "underline";
  label: string;
  className?: string;
}

export function Tabs<Value extends string>({
  className,
  items,
  label,
  onValueChange,
  value,
  variant = "pill",
}: TabsProps<Value>) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLButtonElement>,
  ) {
    if (
      variant !== "underline" ||
      !["ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    let nextIndex = index;
    do {
      nextIndex = (nextIndex + direction + items.length) % items.length;
    } while (items[nextIndex]?.disabled && nextIndex !== index);

    const nextItem = items[nextIndex];
    if (nextItem && !nextItem.disabled) {
      buttonRefs.current[nextIndex]?.focus();
      onValueChange(nextItem.value);
    }
  }

  return (
    <div
      className={classNames("ui-tabs", `ui-tabs--${variant}`, className)}
      role={variant === "underline" ? "tablist" : "group"}
      aria-label={label}
    >
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            role={variant === "underline" ? "tab" : undefined}
            aria-selected={variant === "underline" ? selected : undefined}
            aria-pressed={variant === "pill" ? selected : undefined}
            disabled={item.disabled}
            tabIndex={variant === "underline" && !selected ? -1 : 0}
            className={classNames(
              "ui-tabs__item",
              selected && "ui-tabs__item--active",
            )}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
