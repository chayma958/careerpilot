import { useEffect, useState } from "react";
import { analyzeCv, fetchStoredCvAnalysis, type CvAnalysis } from "../api/ai";
import { getErrorMessage } from "../lib/errors";
import { Spinner } from "./Spinner";
import { secondaryButtonClass } from "../lib/ui";

interface CvAnalysisModalProps {
  documentId: string;
  filename: string;
  applicationId?: string;
  onClose: () => void;
}

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function CvAnalysisModal({ documentId, filename, applicationId, onClose }: CvAnalysisModalProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<CvAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  function runFreshAnalysis(ignoreRef: { current: boolean }) {
    setStatus("loading");
    analyzeCv(documentId, applicationId)
      .then((result) => {
        if (ignoreRef.current) return;
        setData(result);
        setStatus("success");
      })
      .catch((err) => {
        if (ignoreRef.current) return;
        setErrorMessage(getErrorMessage(err));
        setStatus("error");
      });
  }

  useEffect(() => {
    const ignoreRef = { current: false };
    setStatus("loading");

    fetchStoredCvAnalysis(documentId, applicationId)
      .then((stored) => {
        if (ignoreRef.current) return;
        if (stored) {
          setData(stored);
          setStatus("success");
        } else {
          runFreshAnalysis(ignoreRef);
        }
      })
      .catch(() => {
        if (ignoreRef.current) return;
        runFreshAnalysis(ignoreRef);
      });

    return () => {
      ignoreRef.current = true;
    };
  }, [documentId, applicationId]);

  function handleReanalyze() {
    const ignoreRef = { current: false };
    runFreshAnalysis(ignoreRef);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CV Analysis</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{filename}</p>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Spinner className="h-8 w-8 text-orange-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Analyzing against ATS best practices...
              <br />
              This can occasionally take up to a minute on the free AI tier.
            </p>
          </div>
        )}

        {status === "error" && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}

        {status === "success" && data && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  ATS Score
                </p>
                <p className={`text-3xl font-semibold ${scoreColor(data.atsScore)}`}>{data.atsScore}/100</p>
              </div>
              <button
                onClick={handleReanalyze}
                className="text-xs font-medium text-orange-700 hover:underline dark:text-orange-300"
              >
                Re-analyze
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Analyzed {new Date(data.createdAt).toLocaleDateString("en-US")}
            </p>

            {data.missingKeywords.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Missing keywords
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Feedback
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{data.feedback}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className={`${secondaryButtonClass} px-4 py-2`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
