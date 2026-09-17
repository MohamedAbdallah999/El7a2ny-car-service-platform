import type { HTMLAttributes } from "react";
import { classNames } from "../shared.js";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "section" | "div";
  padding?: "none" | "sm" | "md";
}

export function Card({
  as: Element = "div",
  className,
  padding = "md",
  ...props
}: CardProps) {
  return (
    <Element
      {...props}
      className={classNames(
        "ui-card",
        `ui-card--padding-${padding}`,
        className,
      )}
    />
  );
}
