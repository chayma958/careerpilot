import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteApplication, getApplication, updateApplication } from "../api/applications";
import { ApplicationFormModal } from "../components/ApplicationFormModal";
import type { ApplicationFormValues } from "../components/ApplicationFormModal";
import { LoadingState } from "../components/LoadingState";
import { useConfirm } from "../components/ConfirmDialog";
import { cardClass } from "../lib/ui";
import { ApplicationOverview } from "../views/ApplicationDetail/ApplicationOverview";
import { DocumentsSection } from "../views/ApplicationDetail/DocumentsSection";
import { CoverLetterSection } from "../views/ApplicationDetail/CoverLetterSection";
import { InterviewQuestionsSection } from "../views/ApplicationDetail/InterviewQuestionsSection";

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

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const applicationId = id as string;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: application, isLoading } = useQuery({
    queryKey: ["applications", applicationId],
    queryFn: () => getApplication(applicationId),
  });

  const updateMutation = useMutation({
    mutationFn: (values: ApplicationFormValues) => updateApplication(applicationId, toApiPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setIsEditModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      navigate("/applications", { replace: true });
    },
  });

  async function handleDeleteApplication() {
    if (await confirm("Delete this application? This cannot be undone.")) {
      deleteMutation.mutate();
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingState centered />
      </div>
    );
  }

  if (!application) {
    return <p className="p-8 text-sm text-gray-500 dark:text-gray-400">Application not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link
        to="/applications"
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        ← Back to applications
      </Link>

      <div className={`${cardClass} p-6`}>
        <ApplicationOverview
          application={application}
          onEdit={() => setIsEditModalOpen(true)}
          onDelete={handleDeleteApplication}
        />
        <DocumentsSection applicationId={applicationId} documents={application.documents} />
        <CoverLetterSection applicationId={applicationId} />
        <InterviewQuestionsSection
          applicationId={applicationId}
          savedQuestions={application.savedQuestions}
        />
      </div>

      {isEditModalOpen && (
        <ApplicationFormModal
          initial={application}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(values) => updateMutation.mutate(values)}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}
