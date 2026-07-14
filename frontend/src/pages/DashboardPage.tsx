import { useQuery } from "@tanstack/react-query";
import { fetchCharts, fetchStats } from "../api/dashboard";
import { StatTile } from "../components/StatTile";
import { STATUS_COLORS, STATUS_COLORS_DARK } from "../lib/statusColors";
import { useTheme } from "../context/ThemeContext";
import { LoadingState } from "../components/LoadingState";
import { CHART_THEME } from "../lib/chartTheme";
import { ApplicationInsightsPanel } from "../views/Dashboard/ApplicationInsightsPanel";
import { ApplicationsPerMonthChart } from "../views/Dashboard/ApplicationsPerMonthChart";
import { StatusDistributionChart } from "../views/Dashboard/StatusDistributionChart";
import { TopCompaniesChart } from "../views/Dashboard/TopCompaniesChart";

export function DashboardPage() {
  const { theme } = useTheme();
  const colors = CHART_THEME[theme];
  const statusColors = theme === "dark" ? STATUS_COLORS_DARK : STATUS_COLORS;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchStats,
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ["dashboard", "charts"],
    queryFn: fetchCharts,
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

      {stats && stats.totalApplications > 0 && <ApplicationInsightsPanel />}

      {chartsLoading && <LoadingState label="Loading charts..." />}

      {charts && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ApplicationsPerMonthChart data={charts.applicationsPerMonth} colors={colors} />
          <StatusDistributionChart
            data={charts.statusDistribution}
            colors={colors}
            statusColors={statusColors}
          />
          <TopCompaniesChart data={charts.companies} colors={colors} />
        </div>
      )}
    </div>
  );
}
