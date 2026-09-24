import { useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  AuthHeading,
  Button,
  FileUpload,
  Input,
  PhoneInput,
  Select,
} from "@car-platform/ui-web";
import { getPasswordValidationError } from "@car-platform/validation/password";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../auth/useAdminAuth";
import { authApi, businessesApi, uploadsApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";
import { adminTokenStorage } from "../lib/token-storage";
import { fileToBase64 } from "../lib/files";
import {
  Arrow,
  BackButton,
  BusinessAuthShell,
} from "./components/BusinessAuthShell";

const services = [
  "Oil Change",
  "Brake Service",
  "AC Repair",
  "Engine Diagnostics",
  "Wheel Alignment",
  "Tire Replacement",
  "Suspension",
  "Battery",
  "Transmission",
  "Bodywork",
];
const cities = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Mansoura",
  "Tanta",
  "Ismailia",
  "Suez",
  "Aswan",
];
type VerificationStage =
  "registration" | "login" | "provisioning" | "setupError" | "complete";
type DocumentKey =
  "commercialRegistration" | "identityDocument" | "workshopPhoto";
type BusinessHour = {
  dayOfWeek: number;
  label: string;
  isClosed: boolean;
  openingTime: string;
  closingTime: string;
};

const initialBusinessHours: BusinessHour[] = [
  {
    dayOfWeek: 6,
    label: "Saturday",
    isClosed: false,
    openingTime: "08:00",
    closingTime: "20:00",
  },
  {
    dayOfWeek: 0,
    label: "Sunday",
    isClosed: false,
    openingTime: "08:00",
    closingTime: "20:00",
  },
  {
    dayOfWeek: 1,
    label: "Monday",
    isClosed: false,
    openingTime: "08:00",
    closingTime: "20:00",
  },
  {
    dayOfWeek: 2,
    label: "Tuesday",
    isClosed: false,
    openingTime: "08:00",
    closingTime: "20:00",
  },
  {
    dayOfWeek: 3,
    label: "Wednesday",
    isClosed: false,
    openingTime: "08:00",
    closingTime: "20:00",
  },
  {
    dayOfWeek: 4,
    label: "Thursday",
    isClosed: false,
    openingTime: "08:00",
    closingTime: "20:00",
  },
  {
    dayOfWeek: 5,
    label: "Friday",
    isClosed: true,
    openingTime: "08:00",
    closingTime: "20:00",
  },
];

function UploadField({
  description,
  file,
  name,
  onChange,
  title,
}: {
  description: string;
  file?: File;
  name: DocumentKey;
  onChange: (name: DocumentKey, file: File | undefined) => void;
  title: string;
}) {
  return (
    <div className="ui-business-auth__upload-group">
      <strong>{title}</strong>
      <small>{description}</small>
      <FileUpload
        key={file?.name ?? "empty"}
        name={name}
        accept="image/png,image/jpeg,application/pdf"
        label={<span className="ui-business-auth__upload-icon">↥</span>}
        description={
          file ? file.name : "Click to upload · PNG, JPG, PDF · Max 5 MB"
        }
        onChange={(event) => onChange(name, event.target.files?.[0])}
        onRemove={file ? () => onChange(name, undefined) : undefined}
        removeLabel={`Remove ${title}`}
        required={!file}
      />
    </div>
  );
}

export function RegistrationPage() {
  const navigate = useNavigate();
  const { acceptToken } = useAdminAuth();
  const [step, setStep] = useState(1);
  const [verificationStage, setVerificationStage] =
    useState<VerificationStage>("registration");
  const [businessName, setBusinessName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Cairo");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [businessHours, setBusinessHours] = useState(initialBusinessHours);
  const [documents, setDocuments] = useState<
    Partial<Record<DocumentKey, File>>
  >({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [code, setCode] = useState("");
  const [developmentCode, setDevelopmentCode] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentKey[]>([]);
  const [onboardingToken, setOnboardingToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setStep((current) => Math.min(current + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setError(null);
    if (step === 1) navigate("/sign-in");
    else setStep((current) => current - 1);
  }

  function toggleService(service: string) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  function updateBusinessHour(
    dayOfWeek: number,
    update: Partial<
      Pick<BusinessHour, "isClosed" | "openingTime" | "closingTime">
    >,
  ) {
    setBusinessHours((current) =>
      current.map((hours) =>
        hours.dayOfWeek === dayOfWeek ? { ...hours, ...update } : hours,
      ),
    );
  }

  function advanceHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (selectedServices.length === 0) {
      setError("Select at least one service.");
      return;
    }
    const openDays = businessHours.filter((hours) => !hours.isClosed);
    if (openDays.length === 0) {
      setError("Choose at least one open business day.");
      return;
    }
    const invalidDay = openDays.find(
      (hours) => hours.openingTime >= hours.closingTime,
    );
    if (invalidDay) {
      setError(
        `${invalidDay.label}'s closing time must be after its opening time.`,
      );
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectDocument(name: DocumentKey, file: File | undefined) {
    setError(null);
    if (
      file &&
      !["image/png", "image/jpeg", "application/pdf"].includes(file.type)
    ) {
      setError(`${file.name} must be a PNG, JPG, or PDF file.`);
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setError(`${file.name} is larger than 5 MB.`);
      return;
    }
    setDocuments((current) => ({ ...current, [name]: file }));
  }

  async function startRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (selectedServices.length === 0) {
      setError("Select at least one service.");
      setStep(2);
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await authApi.registerAdmin({
        email,
        password,
        firstName,
        lastName,
        phone,
      });
      setRegistrationId(result.registrationId);
      setDevelopmentCode(result.developmentVerificationCode ?? null);
      setCode(result.developmentVerificationCode ?? "");
      setVerificationStage("registration");
      setStep(4);
    } catch (caught) {
      setError(getErrorMessage(caught, "Unable to submit the registration."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.verifyAdminRegistration({ registrationId, code });
      const login = await authApi.login({ email, password });
      if (!("requiresTwoFactor" in login)) {
        await finishProvisioning(login.token);
        return;
      }
      setChallengeToken(login.challengeToken);
      setDevelopmentCode(login.developmentVerificationCode ?? null);
      setCode(login.developmentVerificationCode ?? "");
      setVerificationStage("login");
    } catch (caught) {
      setError(getErrorMessage(caught, "The verification code is invalid."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyPrivilegedLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authApi.verifyLogin({ challengeToken, code });
      await finishProvisioning(result.token);
    } catch (caught) {
      setError(getErrorMessage(caught, "Unable to finish business setup."));
      setVerificationStage((current) =>
        current === "provisioning" ? "setupError" : current,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function finishProvisioning(token: string) {
    setOnboardingToken(token);
    adminTokenStorage.setToken(token);
    try {
      await provisionBusiness();
      await acceptToken(token);
    } catch (caught) {
      setVerificationStage("setupError");
      throw caught;
    }
  }

  async function retryProvisioning() {
    setError(null);
    setIsSubmitting(true);
    try {
      await provisionBusiness();
      await acceptToken(onboardingToken);
    } catch (caught) {
      setError(getErrorMessage(caught, "Unable to finish business setup."));
      setVerificationStage("setupError");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function provisionBusiness() {
    setVerificationStage("provisioning");
    let activeBusinessId = businessId;
    if (!activeBusinessId) {
      const businessResult = await businessesApi.create({
        name: businessName,
        businessType: "MULTI_SERVICE",
        email,
        phone,
        onboardingServices: selectedServices,
      });
      activeBusinessId = businessResult.business.id;
      setBusinessId(activeBusinessId);
    }
    let activeBranchId = branchId;
    if (!activeBranchId) {
      const branchResult = await businessesApi.createBranch(activeBusinessId, {
        name: `${businessName} Main Branch`,
        phone,
        email,
        addressLine1: address,
        city,
        country: "Egypt",
        isPrimary: true,
      });
      activeBranchId = branchResult.branch.id;
      setBranchId(activeBranchId);
    }
    await businessesApi.setBranchHours(activeBusinessId, activeBranchId, {
      hours: businessHours.map(
        ({ dayOfWeek, isClosed, openingTime, closingTime }) => ({
          dayOfWeek,
          isClosed,
          ...(isClosed ? {} : { openingTime, closingTime }),
        }),
      ),
    });

    const documentTypes: Array<
      [DocumentKey, "COMMERCIAL_REGISTRATION" | "OWNER_ID" | "OTHER"]
    > = [
      ["commercialRegistration", "COMMERCIAL_REGISTRATION"],
      ["identityDocument", "OWNER_ID"],
      ["workshopPhoto", "OTHER"],
    ];
    for (const [key, documentType] of documentTypes) {
      if (uploadedDocuments.includes(key)) continue;
      const file = documents[key];
      if (!file) throw new Error("All verification documents are required.");
      const data = await fileToBase64(file);
      const uploaded = await uploadsApi.upload({
        fileName: file.name,
        mimeType: file.type as "image/png" | "image/jpeg" | "application/pdf",
        data,
      });
      await businessesApi.addDocument(activeBusinessId, {
        documentType,
        fileUrl: uploaded.fileUrl,
      });
      setUploadedDocuments((current) => [...current, key]);
    }
    setDevelopmentCode(null);
    setVerificationStage("complete");
  }

  return (
    <BusinessAuthShell mode="register" step={step}>
      <section className="ui-business-auth">
        {step < 4 ? (
          <BackButton onClick={goBack}>
            {step === 1 ? "Back to sign in" : "Back"}
          </BackButton>
        ) : null}
        {error ? <Alert variant="error">{error}</Alert> : null}

        {step === 1 ? (
          <div className="ui-business-auth__body">
            <AuthHeading
              title="Business Information"
              description="Tell us about your automotive business"
            />
            <form
              className="ui-business-auth__form ui-business-auth__form--compact"
              onSubmit={advance}
            >
              <Input
                name="businessName"
                label="Business Name"
                placeholder="AutoCare Garage"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                required
              />
              <div className="ui-business-auth__row">
                <Input
                  name="firstName"
                  label="Owner First Name"
                  placeholder="Mohamed"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
                  required
                />
                <Input
                  name="lastName"
                  label="Owner Last Name"
                  placeholder="Salah"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  autoComplete="family-name"
                  required
                />
              </div>
              <Input
                name="email"
                type="email"
                label="Business Email"
                placeholder="info@autocare.eg"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
              <PhoneInput
                name="phone"
                label="Phone Number"
                value={phone}
                onValueChange={setPhone}
                placeholder="10 1234 5678"
                hint={null}
                required
              />
              <Select
                name="city"
                label="City"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
              >
                {cities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
              <Input
                name="address"
                label="Full Address"
                placeholder="12 El Mohandiseen St, Giza"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                autoComplete="street-address"
                required
              />
              <Input
                name="password"
                type="password"
                label="Password"
                placeholder="At least 12 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={12}
                autoComplete="new-password"
                hint="Use uppercase, lowercase, a number, and a special character."
                showPasswordToggle
                required
              />
              <Button type="submit" fullWidth endIcon={<Arrow />}>
                Continue
              </Button>
            </form>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="ui-business-auth__body">
            <AuthHeading
              title="Services & Hours"
              description="What services do you offer and when are you open?"
            />
            <form
              className="ui-business-auth__form ui-business-auth__form--compact"
              onSubmit={advanceHours}
            >
              <div>
                <p className="ui-business-auth__section-title">
                  Services Offered
                </p>
                <div className="ui-business-auth__options">
                  {services.map((service) => (
                    <label className="ui-business-auth__option" key={service}>
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service)}
                        onChange={() => toggleService(service)}
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>
              <div className="ui-business-auth__hours">
                <p className="ui-business-auth__section-title">
                  Business Hours
                </p>
                <div className="ui-business-auth__hours-list">
                  {businessHours.map((hours) => (
                    <div
                      className="ui-business-auth__hours-editor"
                      key={hours.dayOfWeek}
                    >
                      <strong>{hours.label}</strong>
                      <label className="ui-business-auth__day-toggle">
                        <input
                          type="checkbox"
                          checked={!hours.isClosed}
                          onChange={(event) =>
                            updateBusinessHour(hours.dayOfWeek, {
                              isClosed: !event.target.checked,
                            })
                          }
                        />
                        Open
                      </label>
                      <div className="ui-business-auth__time-range">
                        <label>
                          <span className="sr-only">
                            {hours.label} opening time
                          </span>
                          <input
                            type="time"
                            value={hours.openingTime}
                            disabled={hours.isClosed}
                            onChange={(event) =>
                              updateBusinessHour(hours.dayOfWeek, {
                                openingTime: event.target.value,
                              })
                            }
                            required={!hours.isClosed}
                          />
                        </label>
                        <span aria-hidden="true">to</span>
                        <label>
                          <span className="sr-only">
                            {hours.label} closing time
                          </span>
                          <input
                            type="time"
                            value={hours.closingTime}
                            disabled={hours.isClosed}
                            onChange={(event) =>
                              updateBusinessHour(hours.dayOfWeek, {
                                closingTime: event.target.value,
                              })
                            }
                            required={!hours.isClosed}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" fullWidth endIcon={<Arrow />}>
                Continue
              </Button>
            </form>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="ui-business-auth__body">
            <AuthHeading
              title="Verification Documents"
              description="We verify all businesses to maintain quality standards"
            />
            <form
              className="ui-business-auth__form ui-business-auth__form--compact"
              onSubmit={startRegistration}
            >
              <UploadField
                name="commercialRegistration"
                file={documents.commercialRegistration}
                onChange={selectDocument}
                title="Commercial Registration"
                description="Business license or commercial registration number"
              />
              <UploadField
                name="identityDocument"
                file={documents.identityDocument}
                onChange={selectDocument}
                title="National ID / Passport"
                description="Owner identification document"
              />
              <UploadField
                name="workshopPhoto"
                file={documents.workshopPhoto}
                onChange={selectDocument}
                title="Workshop Photo"
                description="Clear photo of your workshop exterior"
              />
              <Alert variant="warning" title="Review takes 1–3 business days.">
                You can start setting up your shop while you wait.
              </Alert>
              <label className="ui-business-auth__terms">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  required
                />
                <span>
                  I confirm all submitted documents are authentic and I agree to
                  the <a href="#business-terms">El7a2ny Business Terms</a>
                </span>
              </label>
              <Button
                type="submit"
                fullWidth
                endIcon={<Arrow />}
                loading={isSubmitting}
              >
                Submit Application
              </Button>
            </form>
          </div>
        ) : null}

        {step === 4 && verificationStage !== "complete" ? (
          <div className="ui-business-auth__body">
            <AuthHeading
              title={
                verificationStage === "provisioning" ||
                verificationStage === "setupError"
                  ? "Setting up your business"
                  : verificationStage === "registration"
                    ? "Verify your email"
                    : "Secure your sign in"
              }
              description={
                verificationStage === "provisioning" ||
                verificationStage === "setupError"
                  ? "Saving your business, hours, and documents"
                  : `Enter the code sent to ${email}`
              }
            />
            {developmentCode ? (
              <Alert variant="info" title="Development verification code">
                {developmentCode}
              </Alert>
            ) : null}
            {verificationStage === "provisioning" ? (
              <Alert variant="info">
                Please keep this page open while setup completes.
              </Alert>
            ) : verificationStage === "setupError" ? (
              <Button
                fullWidth
                loading={isSubmitting}
                onClick={() => void retryProvisioning()}
              >
                Retry Business Setup
              </Button>
            ) : (
              <form
                className="ui-business-auth__form"
                onSubmit={
                  verificationStage === "registration"
                    ? verifyRegistration
                    : verifyPrivilegedLogin
                }
              >
                <Input
                  name="code"
                  label="Verification Code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                />
                <Button type="submit" fullWidth loading={isSubmitting}>
                  {verificationStage === "registration"
                    ? "Verify Email"
                    : "Finish Setup"}
                </Button>
              </form>
            )}
          </div>
        ) : null}

        {step === 4 && verificationStage === "complete" ? (
          <div className="ui-business-auth__success">
            <div className="ui-business-auth__success-icon" aria-hidden="true">
              ✓
            </div>
            <h2>Application submitted!</h2>
            <p>
              We saved your business and verification documents. Our team will
              notify you at <strong>{email}</strong> after review.
            </p>
            <div className="ui-business-auth__summary">
              <div className="ui-business-auth__summary-row">
                <span>Business Name</span>
                <strong>{businessName}</strong>
              </div>
              <div className="ui-business-auth__summary-row">
                <span>Status</span>
                <strong>Pending Review</strong>
              </div>
              <div className="ui-business-auth__summary-row">
                <span>Application ID</span>
                <strong>{businessId.slice(0, 8)}</strong>
              </div>
            </div>
            <Button
              fullWidth
              endIcon={<Arrow />}
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : null}
      </section>
    </BusinessAuthShell>
  );
}
