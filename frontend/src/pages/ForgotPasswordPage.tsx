import { type SubmitEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import { getErrorMessage } from "../lib/errors";
import { Spinner } from "../components/Spinner";
import { primaryButtonClass } from "../lib/ui";
import { AuthLayout } from "../components/AuthLayout";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: () => forgotPassword(email),
  });

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <AuthLayout title="Reset your password">
      {mutation.isSuccess ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          If an account exists for <span className="font-medium">{email}</span>, we sent a reset link
          to it.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
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
          <button
            type="submit"
            disabled={mutation.isPending}
            className={`${primaryButtonClass} w-full px-3 py-2`}
          >
            {mutation.isPending && <Spinner className="h-4 w-4" />}
            {mutation.isPending ? "Sending..." : "Send reset link"}
          </button>
          {mutation.isError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {getErrorMessage(mutation.error)}
            </p>
          )}
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
