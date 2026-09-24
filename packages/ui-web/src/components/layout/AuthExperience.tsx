import type { ReactNode } from "react";
import { classNames } from "../shared.js";

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

const businessRegistrationSteps = [
  "Business Info",
  "Services & Hours",
  "Verification",
  "Done",
];

export function BusinessAuthBrandPanel({
  mode,
  currentStep = 1,
}: {
  mode: "login" | "register";
  currentStep?: number;
}) {
  const isLogin = mode === "login";

  return (
    <div
      className={classNames(
        "ui-business-auth-brand",
        isLogin && "ui-business-auth-brand--login",
      )}
    >
      <div className="ui-business-auth-brand__intro">
        <div className="ui-business-auth-brand__logo">
          <span aria-hidden="true" />
          <strong>EL7A2NY</strong>
          <small>Business Portal</small>
        </div>
        <h1>
          {isLogin ? (
            <>
              Run your shop
              <br />
              like a pro.
            </>
          ) : (
            <>
              Register your
              <br />
              business.
            </>
          )}
        </h1>
        <p>
          {isLogin
            ? "Manage bookings, inventory, and revenue — all from one place."
            : "Join 1,200+ shops across Egypt on the El7a2ny platform."}
        </p>
      </div>

      {isLogin ? (
        <ul className="ui-business-auth-brand__benefits">
          <li>
            <span aria-hidden="true">✓</span>
            <div>
              <strong>Zero paperwork</strong>
              <small>Digital service records and invoices</small>
            </div>
          </li>
          <li>
            <span aria-hidden="true">✓</span>
            <div>
              <strong>Real-time dashboard</strong>
              <small>See bookings and revenue at a glance</small>
            </div>
          </li>
          <li>
            <span aria-hidden="true">✓</span>
            <div>
              <strong>Customer management</strong>
              <small>Build loyalty with every interaction</small>
            </div>
          </li>
        </ul>
      ) : (
        <ol className="ui-business-auth-brand__steps">
          {businessRegistrationSteps.map((label, index) => {
            const step = index + 1;
            const complete = step < currentStep;
            return (
              <li
                key={label}
                className={classNames(
                  step === currentStep && "is-current",
                  complete && "is-complete",
                )}
              >
                <span aria-hidden="true">{complete ? "✓" : step}</span>
                {label}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
