import { describe, expect, it } from "vitest";
import { analyzeCvSchema, coverLetterSchema, interviewQuestionsSchema } from "./ai.schema";

const uuid = "550e8400-e29b-41d4-a716-446655440000";

describe("analyzeCvSchema", () => {
  it("accepts a valid documentId with no applicationId", () => {
    expect(analyzeCvSchema.safeParse({ documentId: uuid }).success).toBe(true);
  });

  it("rejects a non-uuid documentId", () => {
    expect(analyzeCvSchema.safeParse({ documentId: "not-a-uuid" }).success).toBe(false);
  });
});

describe("coverLetterSchema", () => {
  it("rejects when neither applicationId nor jobDescription is provided", () => {
    expect(coverLetterSchema.safeParse({}).success).toBe(false);
  });

  it("accepts when only jobDescription is provided", () => {
    expect(coverLetterSchema.safeParse({ jobDescription: "Build things" }).success).toBe(true);
  });

  it("accepts when only applicationId is provided", () => {
    expect(coverLetterSchema.safeParse({ applicationId: uuid }).success).toBe(true);
  });
});

describe("interviewQuestionsSchema", () => {
  it("rejects when neither applicationId nor jobDescription is provided", () => {
    expect(interviewQuestionsSchema.safeParse({}).success).toBe(false);
  });

  it("accepts when jobDescription is provided", () => {
    expect(interviewQuestionsSchema.safeParse({ jobDescription: "Backend role" }).success).toBe(true);
  });
});
