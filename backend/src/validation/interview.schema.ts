import { z } from "zod";

export const createInterviewSchema = z.object({
  applicationId: z.string().uuid(),
  date: z.coerce.date(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInterviewSchema = z.object({
  date: z.coerce.date().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});
