import { type SubmitEvent, useState } from "react";
import type { Application } from "../types";
import { Spinner } from "./Spinner";
import { primaryButtonClass, secondaryButtonClass } from "../lib/ui";

export interface InterviewFormValues {
  applicationId: string;
  date: string;
  location: string;
  notes: string;
}

interface InterviewFormModalProps {
  applications: Application[];
  defaultDate?: string;
  onClose: () => void;
  onSubmit: (values: InterviewFormValues) => void;
  isSubmitting: boolean;
}

const QUICK_TIMES = ["09:00", "11:00", "14:00", "16:00"];

function splitDefaultDate(defaultDate?: string): [string, string] {
  if (!defaultDate) return ["", "09:00"];
  const [datePart, timePart] = defaultDate.split("T");
  return [datePart ?? "", timePart ?? "09:00"];
}

export function InterviewFormModal({
  applications,
  defaultDate,
  onClose,
  onSubmit,
  isSubmitting,
}: InterviewFormModalProps) {
  const [initialDate, initialTime] = splitDefaultDate(defaultDate);
  const [applicationId, setApplicationId] = useState(applications[0]?.id ?? "");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    onSubmit({ applicationId, date: `${date}T${time}`, location, notes });
  }

  const selectedDateLabel = date
    ? new Date(`${date}T00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">New interview</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="applicationId"
            >
              Application
            </label>
            <select
              id="applicationId"
              required
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} — {app.position}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="time">
                Time
              </label>
              <input
                id="time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
              />
            </div>
          </div>

          {selectedDateLabel && (
            <p className="-mt-2 text-xs text-gray-500 dark:text-gray-400">{selectedDateLabel}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {QUICK_TIMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                  time === t
                    ? "border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-500 dark:bg-orange-950 dark:text-orange-300"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="location"
            >
              Location
            </label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Remote, or office address"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} px-4 py-2`}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || applications.length === 0}
              className={`${primaryButtonClass} px-4 py-2`}
            >
              {isSubmitting && <Spinner className="h-4 w-4" />}
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
