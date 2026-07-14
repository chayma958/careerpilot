export const CHART_THEME = {
  light: {
    gridline: "#e1e0d9",
    axisText: "#898781",
    primaryInk: "#0b0b0b",
    sequentialBlue: "#eb6834",
    tooltipBg: "#fcfcfb",
    tooltipBorder: "1px solid rgba(11,11,11,0.10)",
    tooltipText: "#0b0b0b",
  },
  dark: {
    gridline: "#2c2c2a",
    axisText: "#898781",
    primaryInk: "#ffffff",
    sequentialBlue: "#d95926",
    tooltipBg: "#1a1a19",
    tooltipBorder: "1px solid rgba(255,255,255,0.10)",
    tooltipText: "#ffffff",
  },
};

export type ChartThemeColors = (typeof CHART_THEME)["light"];

export function chartTooltipStyle(colors: ChartThemeColors) {
  return {
    background: colors.tooltipBg,
    border: colors.tooltipBorder,
    borderRadius: 6,
    fontSize: 13,
    color: colors.tooltipText,
  };
}

export function formatMonth(month: string) {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}
