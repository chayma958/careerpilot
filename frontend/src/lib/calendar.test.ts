import { describe, expect, it } from "vitest";
import { dateKey, getMonthGrid } from "./calendar";

describe("dateKey", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("zero-pads single-digit months and days", () => {
    expect(dateKey(new Date(2026, 8, 1))).toBe("2026-09-01");
  });
});

describe("getMonthGrid", () => {
  it("always returns exactly 42 days (6 full weeks)", () => {
    expect(getMonthGrid(2026, 6)).toHaveLength(42);
  });

  it("starts the grid on a Sunday", () => {
    const grid = getMonthGrid(2026, 6);
    expect(grid[0].getDay()).toBe(0);
  });

  it("includes the first day of the requested month", () => {
    const grid = getMonthGrid(2026, 6);
    const firstOfMonth = grid.find((d) => d.getMonth() === 6 && d.getDate() === 1);
    expect(firstOfMonth).toBeDefined();
  });

  it("produces consecutive calendar days with no gaps", () => {
    const grid = getMonthGrid(2026, 6);
    for (let i = 1; i < grid.length; i++) {
      const diffMs = grid[i].getTime() - grid[i - 1].getTime();
      expect(diffMs).toBe(24 * 60 * 60 * 1000);
    }
  });
});
