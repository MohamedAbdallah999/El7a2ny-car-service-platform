import type { ReactNode } from "react";
import { classNames } from "../shared.js";

export interface ProfileMenuRowProps {
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onActivate?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ProfileMenuRow({
  className,
  description,
  disabled,
  href,
  icon,
  label,
  onActivate,
  trailing = "›",
}: ProfileMenuRowProps) {
  const content = (
    <>
      {icon ? (
        <span className="ui-profile-row__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="ui-profile-row__content">
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
      <span className="ui-profile-row__trailing" aria-hidden={!trailing}>
        {trailing}
      </span>
    </>
  );

  const rowClassName = classNames(
    "ui-profile-row",
    disabled && "ui-profile-row--disabled",
    className,
  );

  if (href && !disabled) {
    return (
      <a className={rowClassName} href={href} onClick={onActivate}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={rowClassName}
      onClick={onActivate}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
