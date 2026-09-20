import {
  AuthBrandPanel,
  AuthHeading,
  AuthLayout,
  AuthTabs,
  Button,
  Input,
} from "@car-platform/ui-web";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { Location as RouterLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { getErrorMessage } from "../../lib/error";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: RouterLocation } | null)?.from;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from ? `${from.pathname}${from.search}` : "/", {
        replace: true,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout brandPanel={<AuthBrandPanel />}>
      <AuthTabs active="login" />
      <form className="form-stack ui-auth-form" onSubmit={handleSubmit}>
        <AuthHeading
          title="Welcome back"
          description="Sign in to your El7a2ny account"
        />

        {error ? (
          <p
            role="alert"
            className="ui-field__message ui-field__message--error"
          >
            {error}
          </p>
        ) : null}

        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          showPasswordToggle
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="spread-row">
          <Link to="/forgot-password" className="ui-auth-link">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Sign In
        </Button>

        <p className="muted-text" style={{ textAlign: "center" }}>
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
