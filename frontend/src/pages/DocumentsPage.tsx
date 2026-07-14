import { type ChangeEvent, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { deleteDocument, listDocuments, uploadDocument } from "../api/documents";
import type { Document, DocumentType } from "../types";
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ORDER } from "../lib/documentTypes";
import { CvAnalysisModal } from "../components/CvAnalysisModal";
import { LoadingState } from "../components/LoadingState";

export function DocumentsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<DocumentType>("CV");
  const [analyzingDoc, setAnalyzingDoc] = useState<Document | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: listDocuments,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: DocumentType }) => uploadDocument(file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFileName(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      uploadMutation.mutate({ file, type });
    }
  }

  function handleDelete(id: string) {
    if (window.confirm("Delete this document?")) {
      deleteMutation.mutate(id);
    }
  }

  const errorMessage = isAxiosError(uploadMutation.error)
    ? (uploadMutation.error.response?.data as { error?: string } | undefined)?.error
    : undefined;

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Documents</h1>

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DocumentType)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-orange-400"
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
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {uploadMutation.isPending ? "Uploading..." : (selectedFileName ?? "No file selected")}
        </span>
      </div>

      {errorMessage && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}

      {isLoading && <LoadingState />}

      {!isLoading && documents && documents.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No documents yet. Upload your first CV or cover letter.
        </p>
      )}

      {!isLoading && documents && documents.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Filename</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    <a href={doc.url} target="_blank" rel="noreferrer" className="hover:underline">
                      {doc.filename}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {DOCUMENT_TYPE_LABELS[doc.type]}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString("en-US")}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {doc.type === "CV" && (
                      <button
                        onClick={() => setAnalyzingDoc(doc)}
                        className="mr-3 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      >
                        Analyze
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
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

      {analyzingDoc && (
        <CvAnalysisModal
          documentId={analyzingDoc.id}
          filename={analyzingDoc.filename}
          onClose={() => setAnalyzingDoc(null)}
        />
      )}
    </div>
  );
}
