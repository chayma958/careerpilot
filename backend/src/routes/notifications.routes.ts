import { Router } from "express";
import { listNotifications, markNotificationRead } from "../controllers/notifications.controller";
import { requireAuth } from "../middleware/auth";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get("/", listNotifications);
notificationsRouter.patch("/:id/read", markNotificationRead);
