import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getApplication } from "../api/applications";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "../lib/statusColors";
import { Spinner } from "./Spinner";
import { primaryButtonClass, secondaryButtonClass } from "../lib/ui";

interface ApplicationPreviewModalProps {
  applicationId: string;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

export function ApplicationPreviewModal({ applicationId, onClose }: ApplicationPreviewModalProps) {
  const { data: application, isLoading } = useQuery({
    queryKey: ["applications", applicationId],
    queryFn: () => getApplication(applicationId),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500 dark:text-gray-400">
            <Spinner className="h-4 w-4 text-orange-500" />
            Loading...
          </div>
        )}

        {application && (
          <>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {application.company} — {application.position}
                </h2>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[application.status]}`}
                >
                  {STATUS_LABELS[application.status]}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 py-4 dark:border-gray-700">
              <Field label="Location" value={application.location} />
              <Field label="Salary" value={application.salary} />
              <Field
                label="Applied"
                value={
                  application.applicationDate
                    ? new Date(application.applicationDate).toLocaleDateString("en-US")
                    : undefined
                }
              />
              {application.jobUrl && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Job URL
                  </p>
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 block truncate text-sm text-orange-600 hover:underline dark:text-orange-400"
                  >
                    {application.jobUrl}
                  </a>
                </div>
              )}
            </div>

            {application.description && (
              <div className="border-t border-gray-100 py-4 dark:border-gray-700">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Job description
                </p>
                <p className="line-clamp-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {application.description}
                </p>
              </div>
            )}

            {application.notes && (
              <div className="border-t border-gray-100 py-4 dark:border-gray-700">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Notes
                </p>
                <p className="line-clamp-3 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {application.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
              <span>
                {application.interviews.length} interview{application.interviews.length === 1 ? "" : "s"} ·{" "}
                {application.documents.length} document{application.documents.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className={`${secondaryButtonClass} px-4 py-2`}>
                Close
              </button>
              <Link to={`/applications/${applicationId}`} className={`${primaryButtonClass} px-4 py-2`}>
                View full details →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
