import { z } from "zod";

const statusEnum = z.enum([
  "SAVED",
  "APPLIED",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "ACCEPTED",
]);

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  status: statusEnum.optional().default("SAVED"),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  notes: z.string().optional(),
  applicationDate: z.coerce.date().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const updateStatusSchema = z.object({
  status: statusEnum,
});
