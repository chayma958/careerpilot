import { describe, expect, it } from "vitest";
import { loginSchema, resetPasswordSchema, signupSchema } from "./auth.schema";

describe("signupSchema", () => {
  const base = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "StrongPass1!",
    confirmPassword: "StrongPass1!",
  };

  it("accepts a valid signup payload", () => {
    expect(signupSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({ ...base, password: "Ab1!", confirmPassword: "Ab1!" });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing an uppercase letter", () => {
    const result = signupSchema.safeParse({ ...base, password: "weakpass1!", confirmPassword: "weakpass1!" });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing a special character", () => {
    const result = signupSchema.safeParse({ ...base, password: "WeakPass1", confirmPassword: "WeakPass1" });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched password confirmation", () => {
    const result = signupSchema.safeParse({ ...base, confirmPassword: "Different1!" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects an invalid email", () => {
    const result = signupSchema.safeParse({ ...base, email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("defaults rememberMe to false when omitted", () => {
    const result = loginSchema.safeParse({ email: "jane@example.com", password: "anything" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rememberMe).toBe(false);
    }
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "jane@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "StrongPass1!",
      confirmPassword: "StrongPass2!",
    });
    expect(result.success).toBe(false);
  });

  it("accepts matching strong passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "StrongPass1!",
      confirmPassword: "StrongPass1!",
    });
    expect(result.success).toBe(true);
  });
});
