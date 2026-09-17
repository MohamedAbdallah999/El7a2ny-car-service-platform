import { AuthLayout, Button, Input, OtpInput } from "@car-platform/ui-web";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../lib/api";
import { getErrorMessage } from "../../lib/error";

type Step = "request" | "reset" | "done";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await authApi.forgotPassword({ email });
      setResetToken(result.resetToken);
      setStep("reset");
    } catch (err) {
      setError(getErrorMessage(err, "Could not find an account with that email."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetToken) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ resetToken, code, newPassword });
      setStep("done");
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
            Reset your password to get back into your account.
          </p>
        </div>
      }
    >
      {step === "request" ? (
        <form className="form-stack" onSubmit={handleRequestSubmit}>
          <div>
            <h2>Forgot password</h2>
            <p className="muted-text">
              Enter your email and we&apos;ll text a code to your phone on
              file.
            </p>
          </div>

          {error ? (
            <p role="alert" className="ui-field__message ui-field__message--error">
              {error}
            </p>
          ) : null}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Button type="submit" fullWidth loading={isSubmitting}>
            Send code
          </Button>

          <p className="muted-text" style={{ textAlign: "center" }}>
            <Link to="/login">Back to sign in</Link>
          </p>
        </form>
      ) : step === "reset" ? (
        <form className="form-stack" onSubmit={handleResetSubmit}>
          <div>
            <h2>Enter your new password</h2>
            <p className="muted-text">Check your phone for the code</p>
          </div>

          {error ? (
            <p role="alert" className="ui-field__message ui-field__message--error">
              {error}
            </p>
          ) : null}

          <OtpInput value={code} onValueChange={setCode} invalid={Boolean(error)} />
          <Input
            label="New password"
            type="password"
            hint="At least 12 characters, with upper/lowercase, a number, and a symbol"
            autoComplete="new-password"
            showPasswordToggle
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            disabled={code.length < 4}
          >
            Reset password
          </Button>
        </form>
      ) : (
        <div className="form-stack">
          <h2>Password reset</h2>
          <p className="muted-text">
            Your password has been reset. You can now sign in with your new
            password.
          </p>
          <Button fullWidth onClick={() => navigate("/login", { replace: true })}>
            Back to sign in
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
