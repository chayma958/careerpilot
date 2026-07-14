export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "ACCEPTED";

export interface Application {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  location?: string | null;
  salary?: string | null;
  jobUrl?: string | null;
  description?: string | null;
  notes?: string | null;
  applicationDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDetail extends Application {
  interviews: ApplicationInterview[];
  documents: Document[];
  savedQuestions: SavedInterviewQuestionsEntry[];
}

export interface SavedInterviewQuestionsEntry {
  id: string;
  questions: string[];
  createdAt: string;
  applicationId: string;
}

export interface ApplicationInterview {
  id: string;
  date: string;
  location?: string | null;
  notes?: string | null;
  applicationId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
}

export type DocumentType = "CV" | "COVER_LETTER" | "CERTIFICATE" | "OTHER";

export interface Document {
  id: string;
  filename: string;
  type: DocumentType;
  url: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  date: string;
  location?: string | null;
  notes?: string | null;
  applicationId: string;
  application: {
    id: string;
    company: string;
    position: string;
    status: ApplicationStatus;
  };
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  applicationId?: string | null;
}
