import type { ReactNode } from "react";

export function AuthBrandPanel() {
  return (
    <div className="ui-auth-brand">
      <div className="ui-auth-brand__logo">
        <span aria-hidden="true" /> EL7A2NY
      </div>
      <div className="ui-auth-brand__message">
        <p className="ui-auth-brand__eyebrow">
          Egypt&apos;s #1 Automotive Platform
        </p>
        <h1>
          Your car
          <br />
          deserves the
          <br />
          best care.
        </h1>
        <p className="ui-auth-brand__copy">
          Book services, request repairs, and find genuine parts from top
          automotive shops near you.
        </p>
        <ul className="ui-auth-brand__proof">
          <li>15,000+ registered customers</li>
          <li>200+ verified automotive shops</li>
          <li>Trusted service since 2022</li>
        </ul>
      </div>
    </div>
  );
}

export function AuthTabs({
  active,
  loginHref = "/login",
  registerHref = "/register",
}: {
  active: "login" | "register";
  loginHref?: string;
  registerHref?: string;
}) {
  return (
    <nav className="ui-auth-tabs" aria-label="Authentication">
      <a className={active === "login" ? "is-active" : ""} href={loginHref}>
        Sign In
      </a>
      <a
        className={active === "register" ? "is-active" : ""}
        href={registerHref}
      >
        Create Account
      </a>
    </nav>
  );
}

export function AuthProgress({
  currentStep,
  status,
}: {
  currentStep: number;
  status?: ReactNode;
}) {
  const labels = ["Welcome", "Add Vehicle", "Done"];
  return (
    <div className="ui-auth-progress">
      {status ? <div className="ui-auth-progress__status">{status}</div> : null}
      <div className="ui-auth-progress__track" aria-hidden="true">
        <span style={{ width: `${(currentStep / labels.length) * 100}%` }} />
      </div>
      <ol>
        {labels.map((label, index) => (
          <li
            className={index + 1 <= currentStep ? "is-active" : ""}
            key={label}
          >
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function AuthHeading({
  title,
  description,
}: {
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <header className="ui-auth-heading">
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}
