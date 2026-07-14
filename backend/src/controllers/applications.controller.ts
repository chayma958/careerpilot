import { ApplicationStatus } from "@prisma/client";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import {
  createApplicationSchema,
  updateApplicationSchema,
  updateStatusSchema,
} from "../validation/application.schema";

export async function listApplications(req: AuthedRequest, res: Response) {
  const { status, search } = req.query;
  const isValidStatus = typeof status === "string" && status in ApplicationStatus;

  const applications = await prisma.application.findMany({
    where: {
      userId: req.userId,
      ...(isValidStatus ? { status: status as ApplicationStatus } : {}),
      ...(typeof search === "string" && search.trim()
        ? {
            OR: [
              { company: { contains: search.trim(), mode: "insensitive" } },
              { position: { contains: search.trim(), mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ applications });
}

export async function createApplication(req: AuthedRequest, res: Response) {
  const parsed = createApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const application = await prisma.application.create({
    data: { ...parsed.data, userId: req.userId as string },
  });

  return res.status(201).json({ application });
}

export async function getApplication(req: AuthedRequest, res: Response) {
  const application = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: {
      interviews: { orderBy: { date: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      savedQuestions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }

  return res.json({ application });
}

export async function updateApplication(req: AuthedRequest, res: Response) {
  const parsed = updateApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const existing = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Application not found" });
  }

  const application = await prisma.application.update({
    where: { id: existing.id },
    data: parsed.data,
  });

  return res.json({ application });
}

export async function updateApplicationStatus(req: AuthedRequest, res: Response) {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const existing = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Application not found" });
  }

  const application = await prisma.application.update({
    where: { id: existing.id },
    data: { status: parsed.data.status },
  });

  return res.json({ application });
}

export async function attachDocument(req: AuthedRequest, res: Response) {
  const { documentId } = req.body as { documentId?: string };
  if (!documentId) {
    return res.status(400).json({ error: "documentId is required" });
  }

  const application = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: req.userId },
  });
  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: { documents: { connect: { id: document.id } } },
    include: { documents: true },
  });

  return res.json({ documents: updated.documents });
}

export async function detachDocument(req: AuthedRequest, res: Response) {
  const application = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: { documents: { disconnect: { id: req.params.documentId } } },
    include: { documents: true },
  });

  return res.json({ documents: updated.documents });
}

export async function deleteApplication(req: AuthedRequest, res: Response) {
  const existing = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Application not found" });
  }

  await prisma.application.delete({ where: { id: existing.id } });

  return res.status(204).send();
}
