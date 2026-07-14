import { prisma } from "./prisma";
import { sendNotificationEmail } from "./email";

const FOLLOW_UP_AFTER_DAYS = 7;
const SAVED_REMINDER_AFTER_DAYS = 3;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function generateNotifications(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();
  const tomorrowStart = startOfDay(addDays(now, 1));
  const tomorrowEnd = addDays(tomorrowStart, 1);

  const upcomingInterviews = await prisma.interview.findMany({
    where: {
      application: { userId },
      date: { gte: tomorrowStart, lt: tomorrowEnd },
    },
    include: { application: { select: { company: true, position: true } } },
  });

  for (const interview of upcomingInterviews) {
    const message = `Interview tomorrow with ${interview.application.company} (${interview.application.position})`;
    const existing = await prisma.notification.findFirst({ where: { userId, message } });
    if (existing) continue;

    await prisma.notification.create({ data: { userId, message, applicationId: interview.applicationId } });
    await sendNotificationEmail(user.email, "Interview reminder", message);
  }

  const staleApplied = await prisma.application.findMany({
    where: {
      userId,
      status: "APPLIED",
      OR: [
        { applicationDate: { lte: addDays(now, -FOLLOW_UP_AFTER_DAYS) } },
        { applicationDate: null, createdAt: { lte: addDays(now, -FOLLOW_UP_AFTER_DAYS) } },
      ],
      interviews: { none: {} },
    },
  });

  for (const application of staleApplied) {
    const message = `Follow up with ${application.company} — you applied over a week ago with no response`;
    const existing = await prisma.notification.findFirst({ where: { userId, message } });
    if (existing) continue;

    await prisma.notification.create({ data: { userId, message, applicationId: application.id } });
    await sendNotificationEmail(user.email, "Follow-up reminder", message);
  }

  const staleSaved = await prisma.application.findMany({
    where: {
      userId,
      status: "SAVED",
      createdAt: { lte: addDays(now, -SAVED_REMINDER_AFTER_DAYS) },
    },
  });

  for (const application of staleSaved) {
    const message = `Don't forget to apply to ${application.company} (${application.position}) — you saved it ${SAVED_REMINDER_AFTER_DAYS} days ago and haven't applied yet`;
    const existing = await prisma.notification.findFirst({ where: { userId, message } });
    if (existing) continue;

    await prisma.notification.create({ data: { userId, message, applicationId: application.id } });
    await sendNotificationEmail(user.email, "Don't forget to apply", message);
  }
}
