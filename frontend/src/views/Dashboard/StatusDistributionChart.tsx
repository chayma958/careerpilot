import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardCharts } from "../../api/dashboard";
import type { ApplicationStatus } from "../../types";
import { STATUS_LABELS } from "../../lib/statusColors";
import { chartTooltipStyle, type ChartThemeColors } from "../../lib/chartTheme";

interface StatusDistributionChartProps {
  data: DashboardCharts["statusDistribution"];
  colors: ChartThemeColors;
  statusColors: Record<ApplicationStatus, string>;
}

export function StatusDistributionChart({ data, colors, statusColors }: StatusDistributionChartProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status distribution</h2>
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
            dataKey="status"
            tickFormatter={(status: ApplicationStatus) => STATUS_LABELS[status]}
            tick={{ fill: colors.primaryInk, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={chartTooltipStyle(colors)}
            labelFormatter={(label) => STATUS_LABELS[label as ApplicationStatus]}
          />
          <Bar dataKey="count" name="Applications" barSize={20} radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={statusColors[entry.status as ApplicationStatus]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
