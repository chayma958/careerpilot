import { Router } from "express";
import {
  createInterview,
  deleteInterview,
  listInterviews,
  updateInterview,
} from "../controllers/interviews.controller";
import { requireAuth } from "../middleware/auth";

export const interviewsRouter = Router();

interviewsRouter.use(requireAuth);

interviewsRouter.get("/", listInterviews);
interviewsRouter.post("/", createInterview);
interviewsRouter.patch("/:id", updateInterview);
interviewsRouter.delete("/:id", deleteInterview);
