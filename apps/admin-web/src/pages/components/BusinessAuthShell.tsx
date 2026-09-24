import type { ReactNode } from "react";
import { AuthLayout, BusinessAuthBrandPanel } from "@car-platform/ui-web";

export function Arrow({
  direction = "right",
}: {
  direction?: "left" | "right";
}) {
  return <span aria-hidden="true">{direction === "right" ? "→" : "←"}</span>;
}

export function BusinessAuthShell({
  children,
  mode,
  step,
}: {
  children: ReactNode;
  mode: "login" | "register";
  step?: number;
}) {
  return (
    <AuthLayout
      className={`ui-auth-layout--business${mode === "register" ? " ui-auth-layout--business-register" : ""}`}
      brandPanel={<BusinessAuthBrandPanel mode={mode} currentStep={step} />}
    >
      {children}
    </AuthLayout>
  );
}

export function BackButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className="ui-business-auth__back" onClick={onClick}>
      <Arrow direction="left" />
      {children}
    </button>
  );
}
