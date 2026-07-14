import { describe, expect, it } from "vitest";
import {
  STATUS_BADGE_CLASSES,
  STATUS_COLORS,
  STATUS_COLORS_DARK,
  STATUS_LABELS,
  STATUS_ORDER,
} from "./statusColors";

describe("status color/label maps", () => {
  it("STATUS_ORDER has no duplicate statuses", () => {
    expect(new Set(STATUS_ORDER).size).toBe(STATUS_ORDER.length);
  });

  it("every status in STATUS_ORDER has a label", () => {
    for (const status of STATUS_ORDER) {
      expect(STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it("every status in STATUS_ORDER has a light and dark chart color", () => {
    for (const status of STATUS_ORDER) {
      expect(STATUS_COLORS[status]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(STATUS_COLORS_DARK[status]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("every status in STATUS_ORDER has a badge class string", () => {
    for (const status of STATUS_ORDER) {
      expect(STATUS_BADGE_CLASSES[status]).toContain("dark:");
    }
  });
});
