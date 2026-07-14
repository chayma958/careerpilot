import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { verifyEmail } from "../api/auth";
import { AuthLayout } from "../components/AuthLayout";
import { Spinner } from "../components/Spinner";

export function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const firedForToken = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (firedForToken.current === token) return;
    firedForToken.current = token;

    verifyEmail(token as string)
      .then(() => setStatus("success"))
      .catch((err) => {
        setErrorMessage(
          isAxiosError(err) ? (err.response?.data as { error?: string } | undefined)?.error : undefined,
        );
        setStatus("error");
      });
  }, [token]);

  return (
    <AuthLayout title="Email verification">
      <div className="text-center">
        {status === "loading" && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Spinner className="h-4 w-4 text-orange-500" />
            Verifying...
          </div>
        )}
        {status === "success" && (
          <p className="text-sm text-green-600 dark:text-green-400">Your email has been verified.</p>
        )}
        {status === "error" && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}

        <Link
          to="/login"
          className="mt-6 inline-block text-sm text-gray-900 hover:underline dark:text-gray-100"
        >
          Go to login
        </Link>
      </div>
    </AuthLayout>
  );
}
