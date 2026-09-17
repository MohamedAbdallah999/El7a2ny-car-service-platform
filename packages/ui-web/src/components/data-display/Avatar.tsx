import type { HTMLAttributes } from "react";
import { classNames } from "../shared.js";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string;
  initials?: string;
  size?: AvatarSize;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function Avatar({
  className,
  initials,
  name = "User",
  size = "md",
  ...props
}: AvatarProps) {
  const visibleInitials = initials?.trim() || getInitials(name);

  return (
    <span
      {...props}
      role="img"
      aria-label={props["aria-label"] ?? name}
      className={classNames("ui-avatar", `ui-avatar--${size}`, className)}
    >
      {visibleInitials || "?"}
    </span>
  );
}
