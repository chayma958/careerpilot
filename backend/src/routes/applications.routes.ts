import { Router } from "express";
import {
  attachDocument,
  createApplication,
  deleteApplication,
  detachDocument,
  getApplication,
  listApplications,
  updateApplication,
  updateApplicationStatus,
} from "../controllers/applications.controller";
import { requireAuth } from "../middleware/auth";

export const applicationsRouter = Router();

applicationsRouter.use(requireAuth);

applicationsRouter.get("/", listApplications);
applicationsRouter.post("/", createApplication);
applicationsRouter.get("/:id", getApplication);
applicationsRouter.patch("/:id", updateApplication);
applicationsRouter.delete("/:id", deleteApplication);
applicationsRouter.patch("/:id/status", updateApplicationStatus);
applicationsRouter.post("/:id/documents", attachDocument);
applicationsRouter.delete("/:id/documents/:documentId", detachDocument);
