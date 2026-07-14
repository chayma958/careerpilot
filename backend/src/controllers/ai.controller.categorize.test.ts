import { describe, expect, it } from "vitest";
import { categorize } from "./ai.controller";

describe("categorize", () => {
  it("classifies frontend roles", () => {
    expect(categorize("Senior Frontend Engineer")).toBe("Frontend");
    expect(categorize("React Developer")).toBe("Frontend");
  });

  it("classifies backend roles", () => {
    expect(categorize("Backend Engineer")).toBe("Backend");
    expect(categorize("API Engineer")).toBe("Backend");
  });

  it("classifies full stack roles", () => {
    expect(categorize("Full-Stack Developer")).toBe("Full Stack");
  });

  it("classifies data roles", () => {
    expect(categorize("Data Scientist")).toBe("Data");
    expect(categorize("Machine Learning Engineer")).toBe("Data");
  });

  it("classifies mobile roles", () => {
    expect(categorize("iOS Developer")).toBe("Mobile");
  });

  it("classifies devops roles", () => {
    expect(categorize("DevOps Engineer")).toBe("DevOps");
  });

  it("falls back to Other for unrecognized roles", () => {
    expect(categorize("Marketing Manager")).toBe("Other");
  });

  it("is case-insensitive", () => {
    expect(categorize("FRONTEND ENGINEER")).toBe("Frontend");
  });
});
