import { Router } from "express";
import { authRouter } from "./auth.routes";
import { applicationsRouter } from "./applications.routes";
import { documentsRouter } from "./documents.routes";
import { interviewsRouter } from "./interviews.routes";
import { notificationsRouter } from "./notifications.routes";
import { dashboardRouter } from "./dashboard.routes";
import { aiRouter } from "./ai.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/applications", applicationsRouter);
apiRouter.use("/documents", documentsRouter);
apiRouter.use("/interviews", interviewsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/ai", aiRouter);
