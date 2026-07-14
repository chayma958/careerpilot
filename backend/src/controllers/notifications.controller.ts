import { Response } from "express";
import { prisma } from "../lib/prisma";
import { generateNotifications } from "../lib/notifications";
import { AuthedRequest } from "../middleware/auth";

export async function listNotifications(req: AuthedRequest, res: Response) {
  const userId = req.userId as string;

  await generateNotifications(userId);

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return res.json({ notifications, total, unreadCount, page, hasMore: page * limit < total });
}

export async function markNotificationRead(req: AuthedRequest, res: Response) {
  const existing = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Notification not found" });
  }

  const notification = await prisma.notification.update({
    where: { id: existing.id },
    data: { read: true },
  });

  return res.json({ notification });
}
