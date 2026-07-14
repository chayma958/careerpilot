import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";

export async function getStats(req: AuthedRequest, res: Response) {
  const userId = req.userId as string;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [total, thisMonth, interviews, offers] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.application.count({
      where: {
        userId,
        OR: [
          { applicationDate: { gte: startOfMonth } },
          { applicationDate: null, createdAt: { gte: startOfMonth } },
        ],
      },
    }),
    prisma.application.count({ where: { userId, status: "INTERVIEW" } }),
    prisma.application.count({ where: { userId, status: { in: ["OFFER", "ACCEPTED"] } } }),
  ]);

  const successRate = total === 0 ? 0 : Math.round((offers / total) * 1000) / 10;

  return res.json({
    totalApplications: total,
    applicationsThisMonth: thisMonth,
    interviews,
    offers,
    successRate,
  });
}

export async function getCharts(req: AuthedRequest, res: Response) {
  const userId = req.userId as string;

  const applications = await prisma.application.findMany({
    where: { userId },
    select: { status: true, company: true, createdAt: true, applicationDate: true },
  });

  const perMonthMap = new Map<string, number>();
  const statusMap = new Map<string, number>();
  const companyMap = new Map<string, number>();

  for (const app of applications) {
    const monthKey = (app.applicationDate ?? app.createdAt).toISOString().slice(0, 7);
    perMonthMap.set(monthKey, (perMonthMap.get(monthKey) ?? 0) + 1);
    statusMap.set(app.status, (statusMap.get(app.status) ?? 0) + 1);
    companyMap.set(app.company, (companyMap.get(app.company) ?? 0) + 1);
  }

  const applicationsPerMonth = Array.from(perMonthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  const companies = Array.from(companyMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([company, count]) => ({ company, count }));

  return res.json({ applicationsPerMonth, statusDistribution, companies });
}
