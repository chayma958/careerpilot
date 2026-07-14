import { api } from "../lib/api";
import type { Application, ApplicationDetail, ApplicationStatus, Document } from "../types";

export interface ApplicationInput {
  company: string;
  position: string;
  status?: ApplicationStatus;
  location?: string;
  salary?: string;
  jobUrl?: string;
  description?: string;
  notes?: string;
  applicationDate?: string;
}

export interface ListApplicationsFilters {
  status?: ApplicationStatus;
  search?: string;
}

export async function listApplications(filters: ListApplicationsFilters = {}) {
  const res = await api.get<{ applications: Application[] }>("/applications", { params: filters });
  return res.data.applications;
}

export async function getApplication(id: string) {
  const res = await api.get<{ application: ApplicationDetail }>(`/applications/${id}`);
  return res.data.application;
}

export async function createApplication(data: ApplicationInput) {
  const res = await api.post<{ application: Application }>("/applications", data);
  return res.data.application;
}

export async function updateApplication(id: string, data: Partial<ApplicationInput>) {
  const res = await api.patch<{ application: Application }>(`/applications/${id}`, data);
  return res.data.application;
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const res = await api.patch<{ application: Application }>(`/applications/${id}/status`, { status });
  return res.data.application;
}

export async function deleteApplication(id: string) {
  await api.delete(`/applications/${id}`);
}

export async function attachDocumentToApplication(applicationId: string, documentId: string) {
  const res = await api.post<{ documents: Document[] }>(`/applications/${applicationId}/documents`, {
    documentId,
  });
  return res.data.documents;
}

export async function detachDocumentFromApplication(applicationId: string, documentId: string) {
  const res = await api.delete<{ documents: Document[] }>(
    `/applications/${applicationId}/documents/${documentId}`,
  );
  return res.data.documents;
}
