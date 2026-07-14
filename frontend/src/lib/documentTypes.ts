import type { DocumentType } from "../types";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CV: "CV",
  COVER_LETTER: "Cover letter",
  CERTIFICATE: "Certificate",
  OTHER: "Other",
};

export const DOCUMENT_TYPE_ORDER: DocumentType[] = ["CV", "COVER_LETTER", "CERTIFICATE", "OTHER"];
