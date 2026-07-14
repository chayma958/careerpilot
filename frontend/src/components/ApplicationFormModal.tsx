import { type SubmitEvent, useState } from "react";
import type { Application, ApplicationStatus } from "../types";
import { STATUS_LABELS, STATUS_ORDER } from "../lib/statusColors";
import { Spinner } from "./Spinner";
import { primaryButtonClass, secondaryButtonClass } from "../lib/ui";

export interface ApplicationFormValues {
  company: string;
  position: string;
  status: ApplicationStatus;
  location: string;
  salary: string;
  jobUrl: string;
  description: string;
  notes: string;
  applicationDate: string;
}

interface ApplicationFormModalProps {
  initial?: Application;
  onClose: () => void;
  onSubmit: (values: ApplicationFormValues) => void;
  isSubmitting: boolean;
}

function todayIsoDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function toFormValues(app?: Application): ApplicationFormValues {
  return {
    company: app?.company ?? "",
    position: app?.position ?? "",
    status: app?.status ?? "SAVED",
    location: app?.location ?? "",
    salary: app?.salary ?? "",
    jobUrl: app?.jobUrl ?? "",
    description: app?.description ?? "",
    notes: app?.notes ?? "",
    applicationDate: app?.applicationDate ? app.applicationDate.slice(0, 10) : app ? "" : todayIsoDate(),
  };
}

export function ApplicationFormModal({
  initial,
  onClose,
  onSubmit,
  isSubmitting,
}: ApplicationFormModalProps) {
  const [values, setValues] = useState<ApplicationFormValues>(toFormValues(initial));

  function handleChange<K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {initial ? "Edit application" : "New application"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="company">
                Company
              </label>
              <input
                id="company"
                required
                value={values.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="position">
                Position
              </label>
              <input
                id="position"
                required
                value={values.position}
                onChange={(e) => handleChange("position", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={values.status}
                onChange={(e) => handleChange("status", e.target.value as ApplicationStatus)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
              >
                {STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="applicationDate">
                Application date
              </label>
              <input
                id="applicationDate"
                type="date"
                value={values.applicationDate}
                onChange={(e) => handleChange("applicationDate", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                value={values.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="salary">
                Salary
              </label>
              <input
                id="salary"
                value={values.salary}
                onChange={(e) => handleChange("salary", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="jobUrl">
              Job URL
            </label>
            <input
              id="jobUrl"
              type="url"
              value={values.jobUrl}
              onChange={(e) => handleChange("jobUrl", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="description">
              Job description
            </label>
            <textarea
              id="description"
              rows={3}
              value={values.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              rows={2}
              value={values.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={`${secondaryButtonClass} px-4 py-2`}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={`${primaryButtonClass} px-4 py-2`}>
              {isSubmitting && <Spinner className="h-4 w-4" />}
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
