import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardCharts } from "../../api/dashboard";
import { chartTooltipStyle, type ChartThemeColors } from "../../lib/chartTheme";

interface TopCompaniesChartProps {
  data: DashboardCharts["companies"];
  colors: ChartThemeColors;
}

export function TopCompaniesChart({ data, colors }: TopCompaniesChartProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Top companies</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
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
          <Tooltip contentStyle={chartTooltipStyle(colors)} />
          <Bar dataKey="count" name="Applications" barSize={20} radius={[0, 4, 4, 0]} fill={colors.sequentialBlue} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
