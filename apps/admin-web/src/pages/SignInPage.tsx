import { useState } from "react";
import type { FormEvent } from "react";
import { Alert, AuthHeading, Button, Input } from "@car-platform/ui-web";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../auth/useAdminAuth";
import { authApi } from "../lib/api";
import { getErrorMessage } from "../lib/error";
import { Arrow, BusinessAuthShell } from "./components/BusinessAuthShell";

type View = "login" | "loginOtp" | "forgot" | "reset";

export function SignInPage() {
  const navigate = useNavigate();
  const { acceptToken } = useAdminAuth();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [developmentCode, setDevelopmentCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authApi.login({ email, password });
      if ("requiresTwoFactor" in result) {
        setChallengeToken(result.challengeToken);
        setDevelopmentCode(result.developmentVerificationCode ?? null);
        setCode(result.developmentVerificationCode ?? "");
        setView("loginOtp");
      } else {
        await acceptToken(result.token);
        navigate("/dashboard", { replace: true });
      }
    } catch (caught) {
      setError(getErrorMessage(caught, "Invalid email or password."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authApi.verifyLogin({ challengeToken, code });
      await acceptToken(result.token);
      navigate("/dashboard", { replace: true });
    } catch (caught) {
      setError(getErrorMessage(caught, "The verification code is invalid."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authApi.forgotPassword({ email });
      setResetToken(result.resetToken);
      setDevelopmentCode(result.developmentVerificationCode ?? null);
      setCode(result.developmentVerificationCode ?? "");
      setView("reset");
    } catch (caught) {
      setError(getErrorMessage(caught, "Unable to request a password reset."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ resetToken, code, newPassword });
      setPassword("");
      setCode("");
      setDevelopmentCode(null);
      setView("login");
    } catch (caught) {
      setError(getErrorMessage(caught, "Unable to reset the password."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const heading =
    view === "login"
      ? ["Business Sign In", "Access your El7a2ny Business Portal"]
      : view === "loginOtp"
        ? ["Verify your sign in", "Enter the code sent to your business email"]
        : view === "forgot"
          ? [
              "Reset your password",
              "We’ll send a verification code to your email",
            ]
          : [
              "Choose a new password",
              "Enter the verification code and your new password",
            ];

  return (
    <BusinessAuthShell mode="login">
      <section className="ui-business-auth">
        <AuthHeading title={heading[0]} description={heading[1]} />
        {error ? <Alert variant="error">{error}</Alert> : null}
        {developmentCode ? (
          <Alert variant="info" title="Development verification code">
            {developmentCode}
          </Alert>
        ) : null}

        {view === "login" ? (
          <form className="ui-business-auth__form" onSubmit={submitLogin}>
            <Input
              name="email"
              type="email"
              label="Business Email"
              placeholder="info@autocare.eg"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              showPasswordToggle
              required
            />
            <div className="ui-business-auth__link-row">
              <button
                type="button"
                className="ui-business-auth__link-button"
                onClick={() => {
                  setError(null);
                  setView("forgot");
                }}
              >
                Forgot password?
              </button>
            </div>
            <Button
              type="submit"
              fullWidth
              endIcon={<Arrow />}
              loading={isSubmitting}
            >
              Sign In
            </Button>
          </form>
        ) : null}

        {view === "loginOtp" ? (
          <form className="ui-business-auth__form" onSubmit={verifyLogin}>
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
              Verify & Sign In
            </Button>
            <button
              type="button"
              className="ui-business-auth__back"
              onClick={() => setView("login")}
            >
              ← Back to sign in
            </button>
          </form>
        ) : null}

        {view === "forgot" ? (
          <form className="ui-business-auth__form" onSubmit={requestReset}>
            <Input
              name="email"
              type="email"
              label="Business Email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              Send Reset Code
            </Button>
            <button
              type="button"
              className="ui-business-auth__back"
              onClick={() => setView("login")}
            >
              ← Back to sign in
            </button>
          </form>
        ) : null}

        {view === "reset" ? (
          <form className="ui-business-auth__form" onSubmit={resetPassword}>
            <Input
              name="code"
              label="Verification Code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
            <Input
              name="newPassword"
              type="password"
              label="New Password"
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              showPasswordToggle
              required
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              Reset Password
            </Button>
          </form>
        ) : null}

        {view === "login" ? (
          <div className="ui-business-auth__separator">
            <p>Want to join El7a2ny?</p>
            <Button
              variant="outline"
              fullWidth
              endIcon={<Arrow />}
              onClick={() => navigate("/register")}
            >
              Register Your Business
            </Button>
          </div>
        ) : null}
      </section>
    </BusinessAuthShell>
  );
}
