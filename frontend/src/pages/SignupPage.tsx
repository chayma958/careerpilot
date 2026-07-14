import { type SubmitEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { signup } from "../api/auth";
import { PASSWORD_REQUIREMENTS, isStrongPassword } from "../lib/passwordStrength";
import { OAuthButtons } from "../components/OAuthButtons";
import { Spinner } from "../components/Spinner";
import { primaryButtonClass } from "../lib/ui";
import { AuthLayout } from "../components/AuthLayout";

export function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRequirements, setShowRequirements] = useState(false);

  const mutation = useMutation({
    mutationFn: () => signup({ name, email, password, confirmPassword }),
  });

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;
  const passwordIsStrong = isStrongPassword(password);

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!passwordIsStrong || password !== confirmPassword) {
      setShowRequirements(true);
      return;
    }
    mutation.mutate();
  }

  const errorMessage = isAxiosError(mutation.error)
    ? (mutation.error.response?.data as { error?: string } | undefined)?.error
    : undefined;

  if (mutation.isSuccess) {
    return (
      <AuthLayout title="Check your email">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We sent a verification link to <span className="font-medium">{email}</span>. Verify your
            account, then log in.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm text-gray-900 hover:underline dark:text-gray-100"
          >
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account">
      <form onSubmit={handleSubmit}>
        <OAuthButtons />

        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
        />

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
          onFocus={() => setShowRequirements(true)}
          className="mb-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
        />

        {showRequirements && (
          <ul className="mb-3 space-y-0.5">
            {PASSWORD_REQUIREMENTS.map((req) => {
              const met = req.test(password);
              return (
                <li
                  key={req.label}
                  className={`text-xs ${met ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {met ? "✓" : "○"} {req.label}
                </li>
              );
            })}
          </ul>
        )}

        <label
          className="mb-1 mt-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="confirmPassword"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
        />
        {!passwordsMatch && (
          <p className="mb-3 text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
        )}
        {passwordsMatch && <div className="mb-3" />}

        {errorMessage && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}

        <button type="submit" disabled={mutation.isPending} className={`${primaryButtonClass} w-full px-3 py-2`}>
          {mutation.isPending && <Spinner className="h-4 w-4" />}
          {mutation.isPending ? "Creating account..." : "Sign up"}
        </button>

        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/login" className="hover:underline">
            Already have an account? Log in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
