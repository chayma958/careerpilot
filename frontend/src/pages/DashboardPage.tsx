import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchCharts, fetchStats } from "../api/dashboard";
import { fetchInsights } from "../api/ai";
import { getErrorMessage } from "../lib/errors";
import { StatTile } from "../components/StatTile";
import type { ApplicationStatus } from "../types";
import { STATUS_COLORS, STATUS_COLORS_DARK, STATUS_LABELS } from "../lib/statusColors";
import { useTheme } from "../context/ThemeContext";
import { Spinner } from "../components/Spinner";
import { LoadingState } from "../components/LoadingState";

const CHART_THEME = {
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

function formatMonth(month: string) {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function DashboardPage() {
  const { theme } = useTheme();
  const colors = CHART_THEME[theme];
  const statusColors = theme === "dark" ? STATUS_COLORS_DARK : STATUS_COLORS;

  const tooltipStyle = {
    background: colors.tooltipBg,
    border: colors.tooltipBorder,
    borderRadius: 6,
    fontSize: 13,
    color: colors.tooltipText,
  };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchStats,
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ["dashboard", "charts"],
    queryFn: fetchCharts,
  });

  const {
    data: insights,
    isFetching: insightsFetching,
    isError: insightsIsError,
    error: insightsError,
    refetch: refetchInsights,
  } = useQuery({
    queryKey: ["ai", "insights"],
    queryFn: fetchInsights,
    enabled: false,
    retry: false,
  });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>

      {statsLoading && <LoadingState label="Loading stats..." />}

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatTile label="Total applications" value={stats.totalApplications} />
          <StatTile label="This month" value={stats.applicationsThisMonth} />
          <StatTile label="Interviews" value={stats.interviews} />
          <StatTile label="Offers" value={stats.offers} />
          <StatTile label="Success rate" value={`${stats.successRate}%`} />
        </div>
      )}

      {stats && stats.totalApplications > 0 && (
        <div className="mb-8 rounded-lg border border-orange-100 bg-orange-50 p-5 shadow-sm dark:border-orange-900 dark:bg-orange-950">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-orange-900 dark:text-orange-200">Application insights</h2>
            <button
              onClick={() => refetchInsights()}
              disabled={insightsFetching}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 hover:underline disabled:opacity-50 dark:text-orange-300"
            >
              {insightsFetching && <Spinner className="h-3.5 w-3.5" />}
              {insightsFetching ? "Analyzing..." : insights ? "Re-analyze" : "Analyze my applications"}
            </button>
          </div>

          {!insights && !insightsFetching && (
            <p className="text-sm text-orange-800 dark:text-orange-300">
              Click "Analyze my applications" to get AI-generated insights from your data.
            </p>
          )}
          {!insights && insightsFetching && (
            <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-300">
              <Spinner className="h-4 w-4" />
              Analyzing your applications... this can take up to a minute on the free AI tier.
            </div>
          )}
          {insightsIsError && (
            <p className="text-sm text-red-600 dark:text-red-400">{getErrorMessage(insightsError)}</p>
          )}
          {insights && (
            <>
              <p className="text-sm text-orange-900 dark:text-orange-100">{insights.insight}</p>
              {insights.stats.categoryStats.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {insights.stats.categoryStats.map((c) => (
                    <span
                      key={c.category}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    >
                      {c.category}: {c.responseRate}% response ({c.total})
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {chartsLoading && <LoadingState label="Loading charts..." />}

      {charts && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
            <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              Applications per month
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={charts.applicationsPerMonth}>
                <CartesianGrid vertical={false} stroke={colors.gridline} strokeDasharray="0" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  tick={{ fill: colors.axisText, fontSize: 12 }}
                  axisLine={{ stroke: colors.gridline }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: colors.axisText, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(label) => formatMonth(String(label))} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Applications"
                  stroke={colors.sequentialBlue}
                  strokeWidth={2}
                  fill={colors.sequentialBlue}
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              Status distribution
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.statusDistribution} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid horizontal={false} stroke={colors.gridline} strokeDasharray="0" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: colors.axisText, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="status"
                  tickFormatter={(status: ApplicationStatus) => STATUS_LABELS[status]}
                  tick={{ fill: colors.primaryInk, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(label) => STATUS_LABELS[label as ApplicationStatus]}
                />
                <Bar dataKey="count" name="Applications" barSize={20} radius={[0, 4, 4, 0]}>
                  {charts.statusDistribution.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={statusColors[entry.status as ApplicationStatus]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Top companies</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.companies} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid horizontal={false} stroke={colors.gridline} strokeDasharray="0" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: colors.axisText, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="company"
                  tick={{ fill: colors.primaryInk, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="count"
                  name="Applications"
                  barSize={20}
                  radius={[0, 4, 4, 0]}
                  fill={colors.sequentialBlue}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
