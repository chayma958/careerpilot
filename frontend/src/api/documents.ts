import { api } from "../lib/api";
import type { Document, DocumentType } from "../types";

export async function listDocuments() {
  const res = await api.get<{ documents: Document[] }>("/documents");
  return res.data.documents;
}

export async function uploadDocument(file: File, type: DocumentType) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const res = await api.post<{ document: Document }>("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.document;
}

export async function deleteDocument(id: string) {
  await api.delete(`/documents/${id}`);
}
