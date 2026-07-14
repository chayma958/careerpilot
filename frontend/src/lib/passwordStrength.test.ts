import { describe, expect, it } from "vitest";
import { PASSWORD_REQUIREMENTS, isStrongPassword } from "./passwordStrength";

describe("isStrongPassword", () => {
  it("accepts a password meeting every requirement", () => {
    expect(isStrongPassword("StrongPass1!")).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(isStrongPassword("Ab1!")).toBe(false);
  });

  it("rejects a password with no uppercase letter", () => {
    expect(isStrongPassword("weakpass1!")).toBe(false);
  });

  it("rejects a password with no lowercase letter", () => {
    expect(isStrongPassword("WEAKPASS1!")).toBe(false);
  });

  it("rejects a password with no number", () => {
    expect(isStrongPassword("WeakPassword!")).toBe(false);
  });

  it("rejects a password with no special character", () => {
    expect(isStrongPassword("WeakPassword1")).toBe(false);
  });
});

describe("PASSWORD_REQUIREMENTS", () => {
  it("each requirement's test function agrees with isStrongPassword on a fully valid password", () => {
    const password = "StrongPass1!";
    for (const req of PASSWORD_REQUIREMENTS) {
      expect(req.test(password)).toBe(true);
    }
  });

  it("has exactly 5 requirements", () => {
    expect(PASSWORD_REQUIREMENTS).toHaveLength(5);
  });
});
