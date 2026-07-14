import { Router } from "express";
import { getCharts, getStats } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/stats", getStats);
dashboardRouter.get("/charts", getCharts);
