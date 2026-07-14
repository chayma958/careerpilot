import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchMe } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { Spinner } from "../components/Spinner";

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");
    const oauthError = searchParams.get("error");

    if (oauthError || !token) {
      setError("Sign-in failed. Please try again.");
      return;
    }

    localStorage.setItem("token", token);
    fetchMe()
      .then((user) => {
        setSession(token, user);
        navigate("/", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("token");
        setError("Sign-in failed. Please try again.");
      });
  }, []);

  return (
    <AuthLayout title={error ? "Sign-in failed" : "Signing you in"}>
      <div className="text-center">
        {error ? (
          <>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <Link to="/login" className="text-sm text-gray-900 hover:underline dark:text-gray-100">
              Back to login
            </Link>
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Spinner className="h-4 w-4 text-orange-500" />
            Signing you in...
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
