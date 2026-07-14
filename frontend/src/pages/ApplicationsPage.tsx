import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createApplication, deleteApplication, listApplications } from "../api/applications";
import type { ApplicationStatus } from "../types";
import { ApplicationFormModal } from "../components/ApplicationFormModal";
import type { ApplicationFormValues } from "../components/ApplicationFormModal";
import { ApplicationPreviewModal } from "../components/ApplicationPreviewModal";
import { primaryButtonClass } from "../lib/ui";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ApplicationsIcon } from "../components/icons/ApplicationsIcon";
import { useConfirm } from "../components/ConfirmDialog";
import { ApplicationFiltersBar } from "../views/Applications/ApplicationFiltersBar";
import { ApplicationsTable } from "../views/Applications/ApplicationsTable";

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

  const confirm = useConfirm();

  async function handleDelete(id: string) {
    if (await confirm("Delete this application?")) {
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

      <ApplicationFiltersBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setStatusFilter("");
          setSearch("");
        }}
        searchTooShort={searchTooShort}
      />

      {isLoading && <LoadingState centered />}

      {!isLoading && applications && applications.length === 0 && (
        <EmptyState icon={<ApplicationsIcon className="h-10 w-10" />}
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
        <ApplicationsTable
          applications={applications}
          onPreview={setPreviewingId}
          onDelete={handleDelete}
        />
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
