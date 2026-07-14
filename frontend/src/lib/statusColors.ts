import type { ApplicationStatus } from "../types";

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  ASSESSMENT: "Assessment",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

export const STATUS_ORDER: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
];

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  SAVED: "#2a78d6",
  APPLIED: "#4a3aa7",
  ASSESSMENT: "#eda100",
  INTERVIEW: "#eb6834",
  OFFER: "#1baf7a",
  ACCEPTED: "#008300",
  REJECTED: "#e34948",
};

export const STATUS_COLORS_DARK: Record<ApplicationStatus, string> = {
  SAVED: "#3987e5",
  APPLIED: "#9085e9",
  ASSESSMENT: "#c98500",
  INTERVIEW: "#d95926",
  OFFER: "#199e70",
  ACCEPTED: "#008300",
  REJECTED: "#e66767",
};

export const STATUS_BADGE_CLASSES: Record<ApplicationStatus, string> = {
  SAVED: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  APPLIED: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  ASSESSMENT: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  INTERVIEW: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  OFFER: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  ACCEPTED: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  REJECTED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};
