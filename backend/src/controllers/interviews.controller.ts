import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { createInterviewSchema, updateInterviewSchema } from "../validation/interview.schema";

export async function listInterviews(req: AuthedRequest, res: Response) {
  const interviews = await prisma.interview.findMany({
    where: { application: { userId: req.userId } },
    include: { application: { select: { id: true, company: true, position: true, status: true } } },
    orderBy: { date: "asc" },
  });

  return res.json({ interviews });
}

const STAGES_NOT_TO_REGRESS = new Set(["OFFER", "ACCEPTED", "REJECTED"]);

export async function createInterview(req: AuthedRequest, res: Response) {
  const parsed = createInterviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const application = await prisma.application.findFirst({
    where: { id: parsed.data.applicationId, userId: req.userId },
  });
  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }

  const interview = await prisma.$transaction(async (tx) => {
    const created = await tx.interview.create({
      data: parsed.data,
      include: { application: { select: { id: true, company: true, position: true, status: true } } },
    });

    if (!STAGES_NOT_TO_REGRESS.has(application.status)) {
      await tx.application.update({ where: { id: application.id }, data: { status: "INTERVIEW" } });
      created.application.status = "INTERVIEW";
    }

    return created;
  });

  return res.status(201).json({ interview });
}

export async function updateInterview(req: AuthedRequest, res: Response) {
  const parsed = updateInterviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const existing = await prisma.interview.findFirst({
    where: { id: req.params.id, application: { userId: req.userId } },
  });
  if (!existing) {
    return res.status(404).json({ error: "Interview not found" });
  }

  const interview = await prisma.interview.update({
    where: { id: existing.id },
    data: parsed.data,
    include: { application: { select: { id: true, company: true, position: true, status: true } } },
  });

  return res.json({ interview });
}

export async function deleteInterview(req: AuthedRequest, res: Response) {
  const existing = await prisma.interview.findFirst({
    where: { id: req.params.id, application: { userId: req.userId } },
  });
  if (!existing) {
    return res.status(404).json({ error: "Interview not found" });
  }

  await prisma.interview.delete({ where: { id: existing.id } });

  return res.status(204).send();
}
