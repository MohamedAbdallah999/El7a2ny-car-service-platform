import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../shared.js";

export interface AuthLayoutProps extends HTMLAttributes<HTMLDivElement> {
  brandPanel: ReactNode;
  children: ReactNode;
  restricted?: boolean;
}

export function AuthLayout({
  brandPanel,
  children,
  className,
  restricted = false,
  ...props
}: AuthLayoutProps) {
  return (
    <div
      {...props}
      className={classNames(
        "ui-auth-layout",
        restricted && "ui-auth-layout--restricted",
        className,
      )}
    >
      <aside className="ui-auth-layout__brand">{brandPanel}</aside>
      <main className="ui-auth-layout__content">
        <div className="ui-auth-layout__form">{children}</div>
      </main>
    </div>
  );
}
