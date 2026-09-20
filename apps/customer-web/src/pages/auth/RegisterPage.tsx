import type { VehicleMake, VehicleModel } from "@car-platform/types";
import {
  AuthBrandPanel,
  AuthHeading,
  AuthLayout,
  AuthProgress,
  AuthTabs,
  Button,
  Input,
  OtpInput,
  PhoneInput,
  Select,
} from "@car-platform/ui-web";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, vehiclesApi } from "../../lib/api";
import { localStorageTokenStorage } from "../../lib/token-storage";
import { useAuth } from "../../auth/useAuth";
import { getErrorMessage } from "../../lib/error";

type Step = "details" | "verify" | "vehicle" | "complete";

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
  const [developmentCode, setDevelopmentCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [vehicle, setVehicle] = useState({
    makeId: "",
    modelId: "",
    year: String(new Date().getFullYear()),
    trim: "",
    licensePlate: "",
    mileage: "",
  });

  useEffect(() => {
    if (step !== "vehicle") return;
    void vehiclesApi
      .listMakes()
      .then(({ makes: availableMakes }) => setMakes(availableMakes))
      .catch((err: unknown) =>
        setError(getErrorMessage(err, "Could not load vehicle brands.")),
      );
  }, [step]);

  useEffect(() => {
    if (!vehicle.makeId) {
      return;
    }
    void vehiclesApi
      .listModels(vehicle.makeId)
      .then(({ models: availableModels }) => setModels(availableModels))
      .catch((err: unknown) =>
        setError(getErrorMessage(err, "Could not load vehicle models.")),
      );
  }, [vehicle.makeId]);

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
      setDevelopmentCode(result.developmentVerificationCode ?? null);
      setCode(result.developmentVerificationCode ?? "");
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
      setStep("vehicle");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid or expired verification code."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVehicleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await vehiclesApi.create({
        makeId: vehicle.makeId,
        modelId: vehicle.modelId,
        year: Number(vehicle.year),
        trim: vehicle.trim || undefined,
        licensePlate: vehicle.licensePlate || undefined,
        mileage: vehicle.mileage ? Number(vehicle.mileage) : undefined,
        isPrimary: true,
      });
      setStep("complete");
    } catch (err) {
      setError(getErrorMessage(err, "Could not save your vehicle."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function finishRegistration() {
    await refreshProfile();
    navigate("/", { replace: true });
  }

  return (
    <AuthLayout brandPanel={<AuthBrandPanel />}>
      {step === "details" ? (
        <>
          <AuthTabs active="register" />
          <form
            className="form-stack ui-auth-form"
            onSubmit={handleDetailsSubmit}
          >
            <AuthHeading
              title="Create your account"
              description="Join 15,000+ customers on El7a2ny"
            />

            {error ? (
              <p
                role="alert"
                className="ui-field__message ui-field__message--error"
              >
                {error}
              </p>
            ) : null}

            <div className="ui-auth-form-grid">
              <Input
                label="First Name"
                placeholder="Ahmed"
                required
                value={form.firstName}
                onChange={(event) =>
                  updateField("firstName", event.target.value)
                }
              />
              <Input
                label="Last Name"
                placeholder="Hassan"
                required
                value={form.lastName}
                onChange={(event) =>
                  updateField("lastName", event.target.value)
                }
              />
            </div>
            <Input
              label="Email Address"
              placeholder="ahmed@email.com"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
            <PhoneInput
              label="Phone Number"
              required
              value={form.phone}
              onValueChange={(phone) => updateField("phone", phone)}
            />
            <Input
              label="Password"
              placeholder="Min. 12 characters"
              type="password"
              hint="At least 12 characters, with upper/lowercase, a number, and a symbol"
              autoComplete="new-password"
              showPasswordToggle
              required
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
            />

            <label className="ui-auth-checkbox">
              <input
                type="checkbox"
                checked={acceptedTerms}
                required
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </label>

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              disabled={!acceptedTerms}
            >
              Continue
            </Button>

            <p className="muted-text" style={{ textAlign: "center" }}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </>
      ) : step === "verify" ? (
        <form className="form-stack" onSubmit={handleVerifySubmit}>
          <AuthProgress currentStep={1} />
          <div>
            <AuthHeading
              title="Verify your email"
              description={
                developmentCode
                  ? `Local mode: use code ${developmentCode}`
                  : `We sent a 6-digit code to ${form.email}`
              }
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="ui-field__message ui-field__message--error"
            >
              {error}
            </p>
          ) : null}

          <OtpInput
            value={code}
            onValueChange={setCode}
            invalid={Boolean(error)}
          />

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            disabled={code.length < 4}
          >
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
      ) : step === "vehicle" ? (
        <form className="form-stack" onSubmit={handleVehicleSubmit}>
          <AuthProgress currentStep={2} status="Email verified successfully" />
          <AuthHeading
            title="Add your vehicle"
            description="Add your car so we can show compatible services and parts."
          />
          {error ? (
            <p
              role="alert"
              className="ui-field__message ui-field__message--error"
            >
              {error}
            </p>
          ) : null}
          <div className="ui-auth-form-grid">
            <Select
              label="Brand"
              required
              value={vehicle.makeId}
              onChange={(event) => {
                setModels([]);
                setVehicle((current) => ({
                  ...current,
                  makeId: event.target.value,
                  modelId: "",
                }));
              }}
            >
              <option value="">Select brand</option>
              {makes.map((make) => (
                <option key={make.id} value={make.id}>
                  {make.name}
                </option>
              ))}
            </Select>
            <Select
              label="Model"
              required
              disabled={!vehicle.makeId}
              value={vehicle.modelId}
              onChange={(event) =>
                setVehicle((current) => ({
                  ...current,
                  modelId: event.target.value,
                }))
              }
            >
              <option value="">Select model</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </Select>
            <Input
              label="Year"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              required
              value={vehicle.year}
              onChange={(event) =>
                setVehicle((current) => ({
                  ...current,
                  year: event.target.value,
                }))
              }
            />
            <Input
              label="Engine / Trim"
              placeholder="1.6L 4-cylinder"
              value={vehicle.trim}
              onChange={(event) =>
                setVehicle((current) => ({
                  ...current,
                  trim: event.target.value,
                }))
              }
            />
            <Input
              label="License Plate"
              placeholder="Cairo A 12345"
              value={vehicle.licensePlate}
              onChange={(event) =>
                setVehicle((current) => ({
                  ...current,
                  licensePlate: event.target.value,
                }))
              }
            />
            <Input
              label="Current Mileage (km)"
              type="number"
              min="0"
              placeholder="e.g. 45000"
              value={vehicle.mileage}
              onChange={(event) =>
                setVehicle((current) => ({
                  ...current,
                  mileage: event.target.value,
                }))
              }
            />
          </div>
          <div className="ui-auth-actions">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setStep("complete")}
            >
              Skip for now
            </Button>
            <Button type="submit" fullWidth loading={isSubmitting}>
              Save Vehicle
            </Button>
          </div>
        </form>
      ) : (
        <div className="form-stack ui-auth-success">
          <AuthProgress currentStep={3} status="Account setup complete" />
          <div className="ui-auth-success__icon" aria-hidden="true">
            ✓
          </div>
          <AuthHeading
            title="You're all set!"
            description="Your El7a2ny account is ready. Start finding services near you."
          />
          <div className="ui-auth-next-grid">
            <div>
              <strong>Find Services</strong>
              <span>Book maintenance & repairs</span>
            </div>
            <div>
              <strong>Browse Parts</strong>
              <span>Genuine & aftermarket parts</span>
            </div>
            <div>
              <strong>Track Bookings</strong>
              <span>All your appointments</span>
            </div>
            <div>
              <strong>Manage Cars</strong>
              <span>Your vehicle profiles</span>
            </div>
          </div>
          <Button fullWidth onClick={() => void finishRegistration()}>
            Go to Dashboard
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
