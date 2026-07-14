import { z } from "zod";

export const analyzeCvSchema = z.object({
  documentId: z.string().uuid(),
  applicationId: z.string().uuid().optional(),
});

export const coverLetterSchema = z
  .object({
    applicationId: z.string().uuid().optional(),
    jobDescription: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
  })
  .refine((data) => data.applicationId || data.jobDescription, {
    message: "Either applicationId or jobDescription is required",
  });

export const tailorResumeSchema = z.object({
  documentId: z.string().uuid(),
  applicationId: z.string().uuid().optional(),
  jobDescription: z.string().optional(),
});

export const interviewQuestionsSchema = z
  .object({
    applicationId: z.string().uuid().optional(),
    jobDescription: z.string().optional(),
  })
  .refine((data) => data.applicationId || data.jobDescription, {
    message: "Either applicationId or jobDescription is required",
  });

export const saveCoverLetterSchema = z.object({
  applicationId: z.string().uuid(),
  coverLetter: z.string().min(1),
});

export const saveInterviewQuestionsSchema = z.object({
  applicationId: z.string().uuid(),
  questions: z.array(z.string()).min(1),
});
