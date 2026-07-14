import { type ChangeEvent, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  attachDocumentToApplication,
  detachDocumentFromApplication,
} from "../../api/applications";
import { listDocuments, uploadDocument } from "../../api/documents";
import { tailorResume, type ResumeSuggestion } from "../../api/ai";
import type { Document, DocumentType } from "../../types";
import { getErrorMessage } from "../../lib/errors";
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ORDER } from "../../lib/documentTypes";
import { CvAnalysisModal } from "../../components/CvAnalysisModal";
import { Spinner } from "../../components/Spinner";
import { secondaryButtonClass } from "../../lib/ui";
import { sectionClass, labelClass, errorTextClass } from "./styles";

interface DocumentsSectionProps {
  applicationId: string;
  documents: Document[];
}

export function DocumentsSection({ applicationId, documents }: DocumentsSectionProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [uploadType, setUploadType] = useState<DocumentType>("CV");
  const [analyzingDoc, setAnalyzingDoc] = useState<Document | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [tailoringDraft, setTailoringDraft] = useState<{
    filename: string;
    suggestions: ResumeSuggestion[];
  } | null>(null);

  const { data: allDocuments } = useQuery({
    queryKey: ["documents"],
    queryFn: listDocuments,
  });

  function invalidateApplication() {
    queryClient.invalidateQueries({ queryKey: ["applications", applicationId] });
  }

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

  const tailorMutation = useMutation({
    mutationFn: (doc: Document) => tailorResume(doc.id, applicationId),
    onSuccess: (suggestions, doc) => setTailoringDraft({ filename: doc.filename, suggestions }),
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      uploadMutation.mutate(file);
    }
  }

  const attachedIds = new Set(documents.map((d) => d.id));
  const availableDocuments = allDocuments?.filter((d) => !attachedIds.has(d.id)) ?? [];

  return (
    <div className={sectionClass}>
      <p className={labelClass}>Attached documents</p>

      {documents.length === 0 && (
        <p className="mb-3 text-sm text-gray-400 dark:text-gray-500">
          No documents attached yet. Attach a CV below and you'll be able to analyze it against ATS
          best practices.
        </p>
      )}

      <div className="mb-3 space-y-2">
        {documents.map((doc) => (
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

      {tailorMutation.isError && <p className={errorTextClass}>{getErrorMessage(tailorMutation.error)}</p>}
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
          {uploadMutation.isPending ? "Uploading..." : (selectedFileName ?? "No file selected")}
        </span>
      </div>

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
