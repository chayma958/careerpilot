import { Router } from "express";
import { deleteDocument, listDocuments, uploadDocument } from "../controllers/documents.controller";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

documentsRouter.get("/", listDocuments);
documentsRouter.post("/", upload.single("file"), uploadDocument);
documentsRouter.delete("/:id", deleteDocument);
