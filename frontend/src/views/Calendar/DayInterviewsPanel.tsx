import type { Interview } from "../../types";

interface DayInterviewsPanelProps {
  selectedDate: Date;
  interviews: Interview[];
  onDelete: (id: string) => void;
}

export function DayInterviewsPanel({ selectedDate, interviews, onDelete }: DayInterviewsPanelProps) {
  return (
    <div className="w-80 shrink-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </h3>

      {interviews.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500">No interviews scheduled.</p>
      )}

      <div className="flex flex-col gap-3">
        {interviews.map((interview) => (
          <div key={interview.id} className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(interview.date).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {interview.application.company} — {interview.application.position}
                </p>
                {interview.location && (
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{interview.location}</p>
                )}
                {interview.notes && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{interview.notes}</p>
                )}
              </div>
              <button
                onClick={() => onDelete(interview.id)}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
