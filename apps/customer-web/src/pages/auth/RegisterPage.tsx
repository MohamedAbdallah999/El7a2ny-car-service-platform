import { AuthLayout, Button, Input, OtpInput } from "@car-platform/ui-web";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../lib/api";
import { localStorageTokenStorage } from "../../lib/token-storage";
import { useAuth } from "../../auth/useAuth";
import { getErrorMessage } from "../../lib/error";

type Step = "details" | "verify";

export function RegisterPage() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authApi.register(form);
      setRegistrationId(result.registrationId);
      setStep("verify");
    } catch (err) {
      setError(getErrorMessage(err, "Could not start registration."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!registrationId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authApi.verifyRegistration({ registrationId, code });
      if (!("token" in result)) {
        // Only reachable for admin accounts, which customer-web never
        // registers — kept for type-safety with the shared response union.
        throw new Error("Unexpected registration response.");
      }
      localStorageTokenStorage.setToken(result.token);
      await refreshProfile();
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Invalid or expired verification code."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      brandPanel={
        <div>
          <h1 style={{ color: "inherit" }}>EL7A2NY</h1>
          <p style={{ marginTop: "1rem", opacity: 0.8 }}>
            Create an account to book services, track orders, and manage
            your vehicles.
          </p>
        </div>
      }
    >
      {step === "details" ? (
        <form className="form-stack" onSubmit={handleDetailsSubmit}>
          <div>
            <h2>Create your account</h2>
            <p className="muted-text">It only takes a minute</p>
          </div>

          {error ? (
            <p role="alert" className="ui-field__message ui-field__message--error">
              {error}
            </p>
          ) : null}

          <Input
            label="First name"
            required
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
          />
          <Input
            label="Last name"
            required
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
          <Input
            label="Phone"
            type="tel"
            hint="E.164 format, e.g. +201000000000"
            autoComplete="tel"
            required
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
          <Input
            label="Password"
            type="password"
            hint="At least 12 characters, with upper/lowercase, a number, and a symbol"
            autoComplete="new-password"
            showPasswordToggle
            required
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
          />

          <Button type="submit" fullWidth loading={isSubmitting}>
            Continue
          </Button>

          <p className="muted-text" style={{ textAlign: "center" }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      ) : (
        <form className="form-stack" onSubmit={handleVerifySubmit}>
          <div>
            <h2>Verify your phone</h2>
            <p className="muted-text">
              We sent a code by SMS to {form.phone}
            </p>
          </div>

          {error ? (
            <p role="alert" className="ui-field__message ui-field__message--error">
              {error}
            </p>
          ) : null}

          <OtpInput value={code} onValueChange={setCode} invalid={Boolean(error)} />

          <Button type="submit" fullWidth loading={isSubmitting} disabled={code.length < 4}>
            Verify and continue
          </Button>
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => setStep("details")}
          >
            Back
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
