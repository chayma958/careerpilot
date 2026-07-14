import { type SubmitEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { PASSWORD_REQUIREMENTS, isStrongPassword } from "../lib/passwordStrength";
import { Spinner } from "../components/Spinner";
import { primaryButtonClass } from "../lib/ui";
import { AuthLayout } from "../components/AuthLayout";

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRequirements, setShowRequirements] = useState(false);

  const mutation = useMutation({
    mutationFn: () => resetPassword(token as string, password, confirmPassword),
    onSuccess: () => {
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    },
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

  return (
    <AuthLayout title="Choose a new password">
      {mutation.isSuccess ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Password reset. Redirecting to login...
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="password"
          >
            New password
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
            Confirm new password
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

          {errorMessage && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className={`${primaryButtonClass} w-full px-3 py-2`}
          >
            {mutation.isPending && <Spinner className="h-4 w-4" />}
            {mutation.isPending ? "Resetting..." : "Reset password"}
          </button>
        </form>
      )}

      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link to="/login" className="hover:underline">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
