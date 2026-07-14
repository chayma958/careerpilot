import { Response } from "express";
import { prisma } from "../lib/prisma";
import { deleteAsset, uploadBuffer } from "../lib/cloudinary";
import { AuthedRequest } from "../middleware/auth";
import { uploadDocumentSchema } from "../validation/document.schema";

export async function listDocuments(req: AuthedRequest, res: Response) {
  const documents = await prisma.document.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ documents });
}

export async function uploadDocument(req: AuthedRequest, res: Response) {
  const parsed = uploadDocumentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const { url, publicId } = await uploadBuffer(req.file.buffer, req.file.originalname);

  const document = await prisma.document.create({
    data: {
      filename: req.file.originalname,
      type: parsed.data.type,
      url,
      publicId,
      userId: req.userId as string,
    },
  });

  return res.status(201).json({ document });
}

export async function deleteDocument(req: AuthedRequest, res: Response) {
  const existing = await prisma.document.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Document not found" });
  }

  await deleteAsset(existing.publicId);
  await prisma.document.delete({ where: { id: existing.id } });

  return res.status(204).send();
}
