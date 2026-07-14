import { api } from "../lib/api";
import type { Interview } from "../types";

export interface InterviewInput {
  applicationId: string;
  date: string;
  location?: string;
  notes?: string;
}

export async function listInterviews() {
  const res = await api.get<{ interviews: Interview[] }>("/interviews");
  return res.data.interviews;
}

export async function createInterview(data: InterviewInput) {
  const res = await api.post<{ interview: Interview }>("/interviews", data);
  return res.data.interview;
}

export async function updateInterview(id: string, data: Partial<Omit<InterviewInput, "applicationId">>) {
  const res = await api.patch<{ interview: Interview }>(`/interviews/${id}`, data);
  return res.data.interview;
}

export async function deleteInterview(id: string) {
  await api.delete(`/interviews/${id}`);
}
