import { type ChangeEvent, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  attachDocumentToApplication,
  deleteApplication,
  detachDocumentFromApplication,
  getApplication,
  updateApplication,
} from "../api/applications";
import { listDocuments, uploadDocument } from "../api/documents";
import {
  deleteSavedInterviewQuestions,
  generateCoverLetter,
  generateInterviewQuestions,
  saveCoverLetter,
  saveInterviewQuestions,
  tailorResume,
  type ResumeSuggestion,
} from "../api/ai";
import type { Document, DocumentType } from "../types";
import { getErrorMessage } from "../lib/errors";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "../lib/statusColors";
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ORDER } from "../lib/documentTypes";
import { ApplicationFormModal } from "../components/ApplicationFormModal";
import type { ApplicationFormValues } from "../components/ApplicationFormModal";
import { CvAnalysisModal } from "../components/CvAnalysisModal";
import { Spinner } from "../components/Spinner";
import { LoadingState } from "../components/LoadingState";
import { useConfirm } from "../components/ConfirmDialog";
import {
  cardClass,
  dangerButtonClass,
  discardButtonClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../lib/ui";

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

const sectionClass = "border-t border-gray-100 py-5 dark:border-gray-700";
const labelClass = "mb-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500";
const errorTextClass = "mt-2 text-sm text-red-600 dark:text-red-400";

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const applicationId = id as string;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [uploadType, setUploadType] = useState<DocumentType>("CV");
  const [analyzingDoc, setAnalyzingDoc] = useState<Document | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const [coverLetterDraft, setCoverLetterDraft] = useState<string | null>(null);
  const [questionsDraft, setQuestionsDraft] = useState<string[] | null>(null);
  const [tailoringDraft, setTailoringDraft] = useState<{
    filename: string;
    suggestions: ResumeSuggestion[];
  } | null>(null);

  const { data: application, isLoading } = useQuery({
    queryKey: ["applications", applicationId],
    queryFn: () => getApplication(applicationId),
  });

  const { data: allDocuments } = useQuery({
    queryKey: ["documents"],
    queryFn: listDocuments,
  });

  function invalidateApplication() {
    queryClient.invalidateQueries({ queryKey: ["applications", applicationId] });
  }

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

  const attachMutation = useMutation({
    mutationFn: (documentId: string) => attachDocumentToApplication(applicationId, documentId),
    onSuccess: () => {
      invalidateApplication();
      setSelectedDocId("");
    },
  });

  const detachMutation = useMutation({
    mutationFn: (documentId: string) => detachDocumentFromApplication(applicationId, documentId),
    onSuccess: invalidateApplication,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const document = await uploadDocument(file, uploadType);
      return attachDocumentToApplication(applicationId, document.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      invalidateApplication();
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFileName(null);
    },
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      uploadMutation.mutate(file);
    }
  }

  const confirm = useConfirm();

  async function handleDeleteApplication() {
    if (await confirm("Delete this application? This cannot be undone.")) {
      deleteMutation.mutate();
    }
  }

  const attachedIds = new Set(application?.documents.map((d) => d.id) ?? []);
  const availableDocuments = allDocuments?.filter((d) => !attachedIds.has(d.id)) ?? [];

  const coverLetterMutation = useMutation({
    mutationFn: () => generateCoverLetter(applicationId),
    onSuccess: (text) => setCoverLetterDraft(text),
  });

  const saveCoverLetterMutation = useMutation({
    mutationFn: (text: string) => saveCoverLetter(applicationId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      invalidateApplication();
      setCoverLetterDraft(null);
    },
  });

  const tailorMutation = useMutation({
    mutationFn: (doc: Document) => tailorResume(doc.id, applicationId),
    onSuccess: (suggestions, doc) => setTailoringDraft({ filename: doc.filename, suggestions }),
  });

  const interviewQuestionsMutation = useMutation({
    mutationFn: () => generateInterviewQuestions(applicationId),
    onSuccess: (qs) => setQuestionsDraft(qs),
  });

  const saveQuestionsMutation = useMutation({
    mutationFn: (questions: string[]) => saveInterviewQuestions(applicationId, questions),
    onSuccess: () => {
      invalidateApplication();
      setQuestionsDraft(null);
    },
  });

  const deleteQuestionsMutation = useMutation({
    mutationFn: (savedId: string) => deleteSavedInterviewQuestions(savedId),
    onSuccess: invalidateApplication,
  });

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
            <button onClick={() => setIsEditModalOpen(true)} className={`${secondaryButtonClass} px-3 py-1.5`}>
              Edit
            </button>
            <button onClick={handleDeleteApplication} className={`${dangerButtonClass} px-3 py-1.5`}>
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

        {/* Documents */}
        <div className={sectionClass}>
          <p className={labelClass}>Attached documents</p>

          {application.documents.length === 0 && (
            <p className="mb-3 text-sm text-gray-400 dark:text-gray-500">
              No documents attached yet. Attach a CV below and you'll be able to analyze it against ATS
              best practices.
            </p>
          )}

          <div className="mb-3 space-y-2">
            {application.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
              >
                <a href={doc.url} target="_blank" rel="noreferrer" className="hover:underline dark:text-gray-100">
                  {doc.filename}
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                    {DOCUMENT_TYPE_LABELS[doc.type]}
                  </span>
                </a>
                <div className="flex items-center gap-3">
                  {doc.type === "CV" && (
                    <>
                      <button
                        onClick={() => setAnalyzingDoc(doc)}
                        className="text-xs font-medium text-orange-700 hover:underline dark:text-orange-300"
                      >
                        Analyze
                      </button>
                      <button
                        onClick={() => tailorMutation.mutate(doc)}
                        disabled={tailorMutation.isPending}
                        className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 hover:underline disabled:opacity-50 dark:text-orange-300"
                      >
                        {tailorMutation.isPending && tailorMutation.variables?.id === doc.id ? (
                          <>
                            <Spinner className="h-3 w-3" />
                            Tailoring...
                          </>
                        ) : (
                          "Tailor"
                        )}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => detachMutation.mutate(doc.id)}
                    className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {tailorMutation.isError && (
            <p className={errorTextClass}>{getErrorMessage(tailorMutation.error)}</p>
          )}
          {tailoringDraft && (
            <div className="mb-3 rounded-md border border-gray-200 p-3 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <p className={labelClass + " mb-0"}>Tailoring suggestions — {tailoringDraft.filename}</p>
                <button
                  onClick={() => setTailoringDraft(null)}
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-red-800 dark:hover:bg-red-950 dark:hover:text-red-300"
                >
                  Dismiss
                </button>
              </div>
              <div className="space-y-2">
                {tailoringDraft.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                  >
                    <p className="text-red-600 line-through dark:text-red-400">{s.original}</p>
                    <p className="mt-1 text-green-700 dark:text-green-400">{s.suggested}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
            >
              <option value="">Attach an existing document...</option>
              {availableDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename} ({DOCUMENT_TYPE_LABELS[doc.type]})
                </option>
              ))}
            </select>
            <button
              onClick={() => selectedDocId && attachMutation.mutate(selectedDocId)}
              disabled={!selectedDocId || attachMutation.isPending}
              className={`${secondaryButtonClass} px-3 py-1.5`}
            >
              {attachMutation.isPending && <Spinner className="h-3.5 w-3.5" />}
              Attach
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as DocumentType)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
            >
              {DOCUMENT_TYPE_ORDER.map((t) => (
                <option key={t} value={t}>
                  {DOCUMENT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="flex items-center gap-1.5 rounded-md border border-dashed border-orange-300 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 transition-colors hover:border-orange-400 hover:bg-orange-100 disabled:opacity-50 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5"
                />
              </svg>
              Choose file
            </button>
            <span className="flex-1 truncate text-sm text-gray-500 dark:text-gray-400">
              {uploadMutation.isPending
                ? "Uploading..."
                : (selectedFileName ?? "No file selected")}
            </span>
          </div>
        </div>

        {/* Cover letter */}
        <div className={sectionClass}>
          <p className={labelClass}>Cover letter</p>
          {!coverLetterDraft && (
            <button
              onClick={() => coverLetterMutation.mutate()}
              disabled={coverLetterMutation.isPending}
              className={`${secondaryButtonClass} px-3 py-1.5`}
            >
              {coverLetterMutation.isPending && <Spinner className="h-3.5 w-3.5" />}
              {coverLetterMutation.isPending ? "Generating..." : "Generate cover letter"}
            </button>
          )}
          {coverLetterMutation.isError && (
            <p className={errorTextClass}>{getErrorMessage(coverLetterMutation.error)}</p>
          )}
          {saveCoverLetterMutation.isError && (
            <p className={errorTextClass}>{getErrorMessage(saveCoverLetterMutation.error)}</p>
          )}
          {coverLetterDraft && (
            <div>
              <div className="whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                {coverLetterDraft}
              </div>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => saveCoverLetterMutation.mutate(coverLetterDraft)}
                  disabled={saveCoverLetterMutation.isPending}
                  className={`${primaryButtonClass} px-3 py-1.5`}
                >
                  {saveCoverLetterMutation.isPending && <Spinner className="h-3.5 w-3.5" />}
                  {saveCoverLetterMutation.isPending ? "Saving..." : "Save as PDF"}
                </button>
                <button
                  onClick={() => setCoverLetterDraft(null)}
                  disabled={saveCoverLetterMutation.isPending}
                  className={discardButtonClass}
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Interview questions */}
        <div className={sectionClass}>
          <p className={labelClass}>Interview questions</p>
          {!questionsDraft && (
            <button
              onClick={() => interviewQuestionsMutation.mutate()}
              disabled={interviewQuestionsMutation.isPending}
              className={`${secondaryButtonClass} px-3 py-1.5`}
            >
              {interviewQuestionsMutation.isPending && <Spinner className="h-3.5 w-3.5" />}
              {interviewQuestionsMutation.isPending ? "Generating..." : "Generate interview questions"}
            </button>
          )}
          {interviewQuestionsMutation.isError && (
            <p className={errorTextClass}>{getErrorMessage(interviewQuestionsMutation.error)}</p>
          )}
          {saveQuestionsMutation.isError && (
            <p className={errorTextClass}>{getErrorMessage(saveQuestionsMutation.error)}</p>
          )}
          {questionsDraft && (
            <div>
              <ol className="list-decimal space-y-1.5 rounded-md border border-gray-200 bg-gray-50 p-3 pl-8 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                {questionsDraft.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => saveQuestionsMutation.mutate(questionsDraft)}
                  disabled={saveQuestionsMutation.isPending}
                  className={`${primaryButtonClass} px-3 py-1.5`}
                >
                  {saveQuestionsMutation.isPending && <Spinner className="h-3.5 w-3.5" />}
                  {saveQuestionsMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setQuestionsDraft(null)}
                  disabled={saveQuestionsMutation.isPending}
                  className={discardButtonClass}
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {application.savedQuestions.length > 0 && (
            <div className="mt-4 space-y-3">
              {application.savedQuestions.map((set) => (
                <div
                  key={set.id}
                  className="rounded-md border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Saved {new Date(set.createdAt).toLocaleDateString("en-US")}
                    </p>
                    <button
                      onClick={() => deleteQuestionsMutation.mutate(set.id)}
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                    {set.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <ApplicationFormModal
          initial={application}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(values) => updateMutation.mutate(values)}
          isSubmitting={updateMutation.isPending}
        />
      )}

      {analyzingDoc && (
        <CvAnalysisModal
          documentId={analyzingDoc.id}
          filename={analyzingDoc.filename}
          applicationId={applicationId}
          onClose={() => setAnalyzingDoc(null)}
        />
      )}
    </div>
  );
}
