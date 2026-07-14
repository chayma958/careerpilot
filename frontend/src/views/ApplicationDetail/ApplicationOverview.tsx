import type { ApplicationDetail } from "../../types";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "../../lib/statusColors";
import { dangerButtonClass, secondaryButtonClass } from "../../lib/ui";
import { sectionClass, labelClass } from "./styles";

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

interface ApplicationOverviewProps {
  application: ApplicationDetail;
  onEdit: () => void;
  onDelete: () => void;
}

export function ApplicationOverview({ application, onEdit, onDelete }: ApplicationOverviewProps) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {application.company} — {application.position}
          </h1>
          <span
            className={`mt-2 mb-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[application.status]}`}
          >
            {STATUS_LABELS[application.status]}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className={`${secondaryButtonClass} px-3 py-1.5`}>
            Edit
          </button>
          <button onClick={onDelete} className={`${dangerButtonClass} px-3 py-1.5`}>
            Delete
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-4 ${sectionClass}`}>
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
        <div className={sectionClass}>
          <p className={labelClass}>Job description</p>
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {application.description}
          </p>
        </div>
      )}

      {application.notes && (
        <div className={sectionClass}>
          <p className={labelClass}>Notes</p>
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {application.notes}
          </p>
        </div>
      )}

      {application.interviews.length > 0 && (
        <div className={sectionClass}>
          <p className={labelClass}>Interviews</p>
          <div className="space-y-2">
            {application.interviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-md border border-gray-200 p-2 text-sm dark:border-gray-700"
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(interview.date).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                {interview.location && (
                  <p className="text-gray-500 dark:text-gray-400">{interview.location}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
