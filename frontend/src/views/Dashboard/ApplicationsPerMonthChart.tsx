import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardCharts } from "../../api/dashboard";
import { chartTooltipStyle, formatMonth, type ChartThemeColors } from "../../lib/chartTheme";

interface ApplicationsPerMonthChartProps {
  data: DashboardCharts["applicationsPerMonth"];
  colors: ChartThemeColors;
}

export function ApplicationsPerMonthChart({ data, colors }: ApplicationsPerMonthChartProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
      <h2 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Applications per month</h2>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
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
          <Tooltip contentStyle={chartTooltipStyle(colors)} labelFormatter={(label) => formatMonth(String(label))} />
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
  );
}
