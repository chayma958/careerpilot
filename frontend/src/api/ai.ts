import { api } from "../lib/api";
import type { Document } from "../types";

export interface CvAnalysis {
  id: string;
  atsScore: number;
  missingKeywords: string[];
  feedback: string;
  createdAt: string;
  documentId: string;
  applicationId: string | null;
}

export async function analyzeCv(documentId: string, applicationId?: string) {
  const res = await api.post<CvAnalysis>("/ai/cv-analyzer", { documentId, applicationId });
  return res.data;
}

export async function fetchStoredCvAnalysis(documentId: string, applicationId?: string) {
  const res = await api.get<CvAnalysis | null>("/ai/cv-analyzer", {
    params: { documentId, applicationId },
  });
  return res.data;
}

export async function generateCoverLetter(applicationId: string) {
  const res = await api.post<{ coverLetter: string }>("/ai/cover-letter", { applicationId });
  return res.data.coverLetter;
}

export async function saveCoverLetter(applicationId: string, coverLetter: string) {
  const res = await api.post<{ document: Document }>("/ai/cover-letter/save", {
    applicationId,
    coverLetter,
  });
  return res.data.document;
}

export interface ResumeSuggestion {
  original: string;
  suggested: string;
}

export async function tailorResume(documentId: string, applicationId: string) {
  const res = await api.post<{ suggestions: ResumeSuggestion[] }>("/ai/resume-tailoring", {
    documentId,
    applicationId,
  });
  return res.data.suggestions;
}

export async function generateInterviewQuestions(applicationId: string) {
  const res = await api.post<{ questions: string[] }>("/ai/interview-questions", { applicationId });
  return res.data.questions;
}

export interface SavedInterviewQuestions {
  id: string;
  questions: string[];
  createdAt: string;
  applicationId: string;
}

export async function saveInterviewQuestions(applicationId: string, questions: string[]) {
  const res = await api.post<{ savedQuestions: SavedInterviewQuestions }>("/ai/interview-questions/save", {
    applicationId,
    questions,
  });
  return res.data.savedQuestions;
}

export async function deleteSavedInterviewQuestions(id: string) {
  await api.delete(`/ai/interview-questions/${id}`);
}

export interface InsightsResult {
  stats: {
    totalApplications: number;
    interviews: number;
    offers: number;
    successRate: number;
    categoryStats: { category: string; total: number; responseRate: number }[];
  };
  insight: string;
}

export async function fetchInsights() {
  const res = await api.get<InsightsResult>("/ai/insights");
  return res.data;
}
