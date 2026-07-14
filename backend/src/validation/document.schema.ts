import { z } from "zod";

export const uploadDocumentSchema = z.object({
  type: z.enum(["CV", "COVER_LETTER", "CERTIFICATE", "OTHER"]),
});
