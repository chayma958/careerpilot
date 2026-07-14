import { type SubmitEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { login, resendVerification } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { OAuthButtons } from "../components/OAuthButtons";
import { Spinner } from "../components/Spinner";
import { primaryButtonClass } from "../lib/ui";
import { AuthLayout } from "../components/AuthLayout";

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || "demo@careerpilot.dev";
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "Demo1234!";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [searchParams] = useSearchParams();
  const oauthFailed = searchParams.get("error") === "oauth_failed";

  const mutation = useMutation({
    mutationFn: () => login({ email, password, rememberMe }),
    onSuccess: (data) => {
      setSession(data.token, data.user);
      navigate("/", { replace: true });
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendVerification(email),
  });

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  const errorData = isAxiosError(mutation.error)
    ? (mutation.error.response?.data as { error?: string; code?: string } | undefined)
    : undefined;
  const isUnverified = errorData?.code === "EMAIL_NOT_VERIFIED";

  return (
    <AuthLayout title="Log in to CareerPilot">
      <form onSubmit={handleSubmit}>
        {oauthFailed && (
          <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            Sign-in with that provider failed. Please try again.
          </p>
        )}

        <div className="mb-4 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm dark:border-orange-900 dark:bg-orange-950">
          <p className="font-medium text-orange-900 dark:text-orange-200">Demo account</p>
          <p className="mt-0.5 text-orange-800 dark:text-orange-300">
            {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
          <button
            type="button"
            onClick={() => {
              setEmail(DEMO_EMAIL);
              setPassword(DEMO_PASSWORD);
            }}
            className="mt-1.5 text-sm font-medium text-orange-700 hover:underline dark:text-orange-300"
          >
            Fill in demo account
          </button>
        </div>

        <OAuthButtons />

        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
        />

        <label
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
        />

        <label className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>

        {errorData?.error && !isUnverified && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errorData.error}</p>
        )}

        {isUnverified && (
          <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <p>{errorData?.error}</p>
            {resendMutation.isSuccess ? (
              <p className="mt-1 text-amber-700 dark:text-amber-400">
                Verification email sent — check your inbox.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="mt-1 font-medium underline disabled:opacity-50"
              >
                {resendMutation.isPending ? "Sending..." : "Resend verification email"}
              </button>
            )}
          </div>
        )}

        <button type="submit" disabled={mutation.isPending} className={`${primaryButtonClass} w-full px-3 py-2`}>
          {mutation.isPending && <Spinner className="h-4 w-4" />}
          {mutation.isPending ? "Logging in..." : "Log in"}
        </button>

        <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <Link to="/signup" className="hover:underline">
            Create an account
          </Link>
          <Link to="/forgot-password" className="hover:underline">
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
