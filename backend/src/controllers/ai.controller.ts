import { Response } from "express";
import { prisma } from "../lib/prisma";
import { extractTextFromUrl } from "../lib/extractText";
import { AiRateLimitError, completeJson, completeText } from "../lib/openrouter";
import { uploadBuffer } from "../lib/cloudinary";
import { generateTextPdf } from "../lib/generatePdf";
import { AuthedRequest } from "../middleware/auth";
import {
  analyzeCvSchema,
  coverLetterSchema,
  interviewQuestionsSchema,
  saveCoverLetterSchema,
  saveInterviewQuestionsSchema,
  tailorResumeSchema,
} from "../validation/ai.schema";

async function getOwnedDocument(userId: string, documentId: string) {
  const document = await prisma.document.findFirst({ where: { id: documentId, userId } });
  if (!document) throw new Error("NOT_FOUND:Document not found");
  return document;
}

async function getOwnedApplication(userId: string, applicationId: string) {
  const application = await prisma.application.findFirst({ where: { id: applicationId, userId } });
  if (!application) throw new Error("NOT_FOUND:Application not found");
  return application;
}

function notFoundOr500(err: unknown, res: Response) {
  if (err instanceof AiRateLimitError) {
    return res.status(429).json({ error: err.message, code: "AI_RATE_LIMITED" });
  }
  const message = err instanceof Error ? err.message : "Something went wrong";
  if (message.startsWith("NOT_FOUND:")) {
    return res.status(404).json({ error: message.replace("NOT_FOUND:", "") });
  }
  return res.status(400).json({ error: message });
}

interface CvAnalysisResult {
  atsScore: number;
  missingKeywords: string[];
  feedback: string;
}

export async function analyzeCv(req: AuthedRequest, res: Response) {
  const parsed = analyzeCvSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const document = await getOwnedDocument(req.userId as string, parsed.data.documentId);
    const application = parsed.data.applicationId
      ? await getOwnedApplication(req.userId as string, parsed.data.applicationId)
      : null;

    const resumeText = await extractTextFromUrl(document.url, document.filename);

    const jobContext = application
      ? `Evaluate it against this specific job description for ${application.position} at ${application.company}:\n${application.description ?? "(no description provided)"}`
      : "Evaluate it against general ATS (Applicant Tracking System) best practices for its apparent target role.";

    const result = await completeJson<CvAnalysisResult>(
      "You are an ATS (Applicant Tracking System) resume analyzer. Respond only with JSON matching: " +
        '{ "atsScore": number (0-100), "missingKeywords": string[], "feedback": string }. ' +
        "atsScore reflects how well the resume would pass automated screening. missingKeywords are important " +
        "skills/terms the resume lacks. feedback is 2-3 sentences of concrete, actionable advice.",
      `${jobContext}\n\nResume text:\n${resumeText}`,
    );

    const analysis = await prisma.cvAnalysis.create({
      data: {
        documentId: document.id,
        applicationId: application?.id,
        atsScore: result.atsScore,
        missingKeywords: result.missingKeywords,
        feedback: result.feedback,
      },
    });

    return res.json(analysis);
  } catch (err) {
    return notFoundOr500(err, res);
  }
}

export async function getStoredCvAnalysis(req: AuthedRequest, res: Response) {
  const documentId = req.query.documentId as string | undefined;
  const applicationId = req.query.applicationId as string | undefined;

  if (!documentId) {
    return res.status(400).json({ error: "documentId is required" });
  }

  try {
    await getOwnedDocument(req.userId as string, documentId);

    const analysis = await prisma.cvAnalysis.findFirst({
      where: { documentId, applicationId: applicationId ?? null },
      orderBy: { createdAt: "desc" },
    });

    return res.json(analysis);
  } catch (err) {
    return notFoundOr500(err, res);
  }
}

export async function generateCoverLetter(req: AuthedRequest, res: Response) {
  const parsed = coverLetterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    let company = parsed.data.company;
    let position = parsed.data.position;
    let jobDescription = parsed.data.jobDescription;

    if (parsed.data.applicationId) {
      const application = await getOwnedApplication(req.userId as string, parsed.data.applicationId);
      company = application.company;
      position = application.position;
      jobDescription = application.description ?? jobDescription;
    }

    const coverLetter = await completeText(
      "You write personalized, professional cover letters. Keep it concise (3-4 paragraphs), " +
        "specific to the role and company, and avoid generic filler. Do not invent specific achievements " +
        "that weren't provided; instead speak to genuine interest and relevant general strengths. " +
        "Respond in plain text only — no markdown, no asterisks.",
      `Write a cover letter for the position of ${position ?? "this role"} at ${company ?? "this company"}.\n` +
        `Candidate name: ${user?.name ?? "the candidate"}.\n` +
        `Job description:\n${jobDescription ?? "(not provided)"}`,
    );

    return res.json({ coverLetter });
  } catch (err) {
    return notFoundOr500(err, res);
  }
}

export async function saveCoverLetter(req: AuthedRequest, res: Response) {
  const parsed = saveCoverLetterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const application = await getOwnedApplication(req.userId as string, parsed.data.applicationId);

    const pdfBuffer = await generateTextPdf(
      `Cover Letter — ${application.position} at ${application.company}`,
      parsed.data.coverLetter,
    );
    const filename = `Cover_Letter_${application.company.replace(/\s+/g, "_")}.pdf`;
    const { url, publicId } = await uploadBuffer(pdfBuffer, filename);

    const document = await prisma.document.create({
      data: {
        filename,
        type: "COVER_LETTER",
        url,
        publicId,
        userId: req.userId as string,
        applications: { connect: { id: application.id } },
      },
    });

    return res.status(201).json({ document });
  } catch (err) {
    return notFoundOr500(err, res);
  }
}

interface ResumeTailoringResult {
  suggestions: { original: string; suggested: string }[];
}

export async function tailorResume(req: AuthedRequest, res: Response) {
  const parsed = tailorResumeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const document = await getOwnedDocument(req.userId as string, parsed.data.documentId);
    let jobDescription = parsed.data.jobDescription;
    let roleContext = "";

    if (parsed.data.applicationId) {
      const application = await getOwnedApplication(req.userId as string, parsed.data.applicationId);
      jobDescription = application.description ?? jobDescription;
      roleContext = `${application.position} at ${application.company}`;
    }

    const resumeText = await extractTextFromUrl(document.url, document.filename);

    const result = await completeJson<ResumeTailoringResult>(
      "You improve resume bullet points to better match a target job. Respond only with JSON matching: " +
        '{ "suggestions": [{ "original": string, "suggested": string }] }. ' +
        "Pick 3-6 of the weakest or most generic lines from the resume and rewrite them to be more specific, " +
        "quantified, and aligned with the job description's technologies and priorities. Never invent " +
        "employers, dates, or metrics that contradict the original resume. The 'original' field must be an " +
        "exact, verbatim substring of the resume text provided so it can be located and replaced.",
      `Target role: ${roleContext || "(not specified)"}\nJob description:\n${jobDescription ?? "(not provided)"}\n\n` +
        `Resume text:\n${resumeText}`,
    );

    return res.json(result);
  } catch (err) {
    return notFoundOr500(err, res);
  }
}

interface InterviewQuestionsResult {
  questions: string[];
}

export async function generateInterviewQuestions(req: AuthedRequest, res: Response) {
  const parsed = interviewQuestionsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    let jobDescription = parsed.data.jobDescription;
    let roleContext = "";

    if (parsed.data.applicationId) {
      const application = await getOwnedApplication(req.userId as string, parsed.data.applicationId);
      jobDescription = application.description ?? jobDescription;
      roleContext = `${application.position} at ${application.company}`;
    }

    const result = await completeJson<InterviewQuestionsResult>(
      'Respond only with JSON matching: { "questions": string[] }. Generate 8-10 realistic interview ' +
        "questions for the given role, mixing technical questions specific to the technologies/skills " +
        "mentioned in the job description with behavioral questions.",
      `Target role: ${roleContext || "(not specified)"}\nJob description:\n${jobDescription ?? "(not provided)"}`,
    );

    return res.json(result);
  } catch (err) {
    return notFoundOr500(err, res);
  }
}

export async function saveInterviewQuestions(req: AuthedRequest, res: Response) {
  const parsed = saveInterviewQuestionsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const application = await getOwnedApplication(req.userId as string, parsed.data.applicationId);

    const saved = await prisma.savedInterviewQuestions.create({
      data: { applicationId: application.id, questions: parsed.data.questions },
    });

    return res.status(201).json({ savedQuestions: saved });
  } catch (err) {
    return notFoundOr500(err, res);
  }
}

export async function deleteSavedInterviewQuestions(req: AuthedRequest, res: Response) {
  const existing = await prisma.savedInterviewQuestions.findFirst({
    where: { id: req.params.id, application: { userId: req.userId } },
  });
  if (!existing) {
    return res.status(404).json({ error: "Saved questions not found" });
  }

  await prisma.savedInterviewQuestions.delete({ where: { id: existing.id } });

  return res.status(204).send();
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Frontend: ["frontend", "front-end", "front end", "react", "ui engineer"],
  Backend: ["backend", "back-end", "back end", "api engineer", "server"],
  "Full Stack": ["full stack", "full-stack", "fullstack"],
  Data: ["data scientist", "data engineer", "data analyst", "machine learning", "ml engineer"],
  Mobile: ["mobile", "ios", "android", "react native", "flutter"],
  DevOps: ["devops", "sre", "site reliability", "platform engineer", "infrastructure"],
};

export function categorize(position: string): string {
  const lower = position.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Other";
}

export async function getInsights(req: AuthedRequest, res: Response) {
  const userId = req.userId as string;

  const applications = await prisma.application.findMany({
    where: { userId },
    select: { position: true, status: true },
  });

  const total = applications.length;
  const interviews = applications.filter((a) => a.status === "INTERVIEW").length;
  const offers = applications.filter((a) => ["OFFER", "ACCEPTED"].includes(a.status)).length;
  const successRate = total === 0 ? 0 : Math.round((offers / total) * 1000) / 10;

  const byCategory = new Map<string, { total: number; responded: number }>();
  for (const app of applications) {
    const category = categorize(app.position);
    const entry = byCategory.get(category) ?? { total: 0, responded: 0 };
    entry.total += 1;
    if (app.status !== "SAVED" && app.status !== "APPLIED") entry.responded += 1;
    byCategory.set(category, entry);
  }

  const categoryStats = Array.from(byCategory.entries())
    .filter(([, v]) => v.total >= 2)
    .map(([category, v]) => ({
      category,
      total: v.total,
      responseRate: Math.round((v.responded / v.total) * 1000) / 10,
    }));

  const stats = { totalApplications: total, interviews, offers, successRate, categoryStats };

  if (total === 0) {
    return res.json({ stats, insight: "Add a few applications to start seeing insights." });
  }

  try {
    const insight = await completeText(
      "You summarize a job seeker's application statistics in 2-3 short, encouraging, specific sentences. " +
        "Only reference numbers explicitly provided below — never invent statistics. " +
        "Respond in plain text only — no markdown, no asterisks, no bullet points.",
      `Total applications: ${total}\nInterviews: ${interviews}\nOffers: ${offers}\nSuccess rate: ${successRate}%\n` +
        `Response rate by category: ${JSON.stringify(categoryStats)}`,
    );

    return res.json({ stats, insight });
  } catch (err) {
    return notFoundOr500(err, res);
  }
}
