import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createApplication, deleteApplication, listApplications } from "../api/applications";
import type { ApplicationStatus } from "../types";
import { STATUS_BADGE_CLASSES, STATUS_LABELS, STATUS_ORDER } from "../lib/statusColors";
import { ApplicationFormModal } from "../components/ApplicationFormModal";
import type { ApplicationFormValues } from "../components/ApplicationFormModal";
import { ApplicationPreviewModal } from "../components/ApplicationPreviewModal";
import { primaryButtonClass } from "../lib/ui";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";

function toApiPayload(values: ApplicationFormValues) {
  return {
    company: values.company,
    position: values.position,
    status: values.status,
    location: values.location || undefined,
    salary: values.salary || undefined,
    jobUrl: values.jobUrl || undefined,
    description: values.description || undefined,
    notes: values.notes || undefined,
    applicationDate: values.applicationDate || undefined,
  };
}

export function ApplicationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [search, setSearch] = useState("");

  const trimmedSearch = search.trim();
  const effectiveSearch = trimmedSearch.length >= 3 ? trimmedSearch : undefined;

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications", { status: statusFilter, search: effectiveSearch }],
    queryFn: () =>
      listApplications({
        status: statusFilter || undefined,
        search: effectiveSearch,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (values: ApplicationFormValues) => createApplication(toApiPayload(values)),
    onSuccess: (application) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setIsCreateModalOpen(false);
      navigate(`/applications/${application.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });

  function handleDelete(id: string) {
    if (window.confirm("Delete this application?")) {
      deleteMutation.mutate(id);
    }
  }

  const hasActiveFilters = statusFilter !== "" || trimmedSearch !== "";
  const searchTooShort = trimmedSearch.length > 0 && trimmedSearch.length < 3;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Applications</h1>
        <button onClick={() => setIsCreateModalOpen(true)} className={`${primaryButtonClass} px-4 py-2`}>
          New application
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company or position..."
          className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-orange-400"
        >
          <option value="">All statuses</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            onClick={() => {
              setStatusFilter("");
              setSearch("");
            }}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Clear filters
          </button>
        )}
      </div>

      {searchTooShort && (
        <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
          Type at least 3 characters to search.
        </p>
      )}

      {isLoading && <LoadingState />}

      {!isLoading && applications && applications.length === 0 && (
        <EmptyState
          icon={
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 14.15v4.098a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25v-4.098M20.25 14.15L15 10.5m5.25 3.65l-5.7 3.5a2.25 2.25 0 01-2.4 0l-5.7-3.5m14.85 0V8.85a2.25 2.25 0 00-1.05-1.9l-6-3.75a2.25 2.25 0 00-2.4 0l-6 3.75a2.25 2.25 0 00-1.05 1.9v5.3"
              />
            </svg>
          }
          title={
            hasActiveFilters ? "No applications match your filters." : "No applications yet — add your first one to start tracking."
          }
          action={
            !hasActiveFilters && (
              <button onClick={() => setIsCreateModalOpen(true)} className={`${primaryButtonClass} px-4 py-2`}>
                New application
              </button>
            )
          }
        />
      )}

      {!isLoading && applications && applications.length > 0 && (
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
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[app.status]}`}
                    >
                      {STATUS_LABELS[app.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{app.location ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{app.salary ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {app.applicationDate
                      ? new Date(app.applicationDate).toLocaleDateString("en-US")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setPreviewingId(app.id)}
                      className="mr-3 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
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
      )}

      {isCreateModalOpen && (
        <ApplicationFormModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(values) => createMutation.mutate(values)}
          isSubmitting={createMutation.isPending}
        />
      )}

      {previewingId && (
        <ApplicationPreviewModal applicationId={previewingId} onClose={() => setPreviewingId(null)} />
      )}
    </div>
  );
}
