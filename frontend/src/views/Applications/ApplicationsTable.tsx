import { Link } from "react-router-dom";
import type { Application } from "../../types";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "../../lib/statusColors";

interface ApplicationsTableProps {
  applications: Application[];
  onPreview: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ApplicationsTable({ applications, onPreview, onDelete }: ApplicationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Position</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Salary</th>
            <th className="px-4 py-3 font-medium">Applied</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                <Link to={`/applications/${app.id}`} className="hover:underline">
                  {app.company}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{app.position}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[app.status]}`}>
                  {STATUS_LABELS[app.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{app.location ?? "—"}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{app.salary ?? "—"}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                {app.applicationDate ? new Date(app.applicationDate).toLocaleDateString("en-US") : "—"}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <button
                  onClick={() => onPreview(app.id)}
                  className="mr-3 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  Preview
                </button>
                <button
                  onClick={() => onDelete(app.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
