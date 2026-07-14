import { Router } from "express";
import {
  analyzeCv,
  deleteSavedInterviewQuestions,
  generateCoverLetter,
  generateInterviewQuestions,
  getInsights,
  getStoredCvAnalysis,
  saveCoverLetter,
  saveInterviewQuestions,
  tailorResume,
} from "../controllers/ai.controller";
import { requireAuth } from "../middleware/auth";

export const aiRouter = Router();

aiRouter.use(requireAuth);

aiRouter.post("/cv-analyzer", analyzeCv);
aiRouter.get("/cv-analyzer", getStoredCvAnalysis);
aiRouter.post("/cover-letter", generateCoverLetter);
aiRouter.post("/cover-letter/save", saveCoverLetter);
aiRouter.post("/resume-tailoring", tailorResume);
aiRouter.post("/interview-questions", generateInterviewQuestions);
aiRouter.post("/interview-questions/save", saveInterviewQuestions);
aiRouter.delete("/interview-questions/:id", deleteSavedInterviewQuestions);
aiRouter.get("/insights", getInsights);
