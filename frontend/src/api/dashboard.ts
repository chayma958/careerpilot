import { api } from "../lib/api";

export interface DashboardStats {
  totalApplications: number;
  applicationsThisMonth: number;
  interviews: number;
  offers: number;
  successRate: number;
}

export interface DashboardCharts {
  applicationsPerMonth: { month: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  companies: { company: string; count: number }[];
}

export async function fetchStats() {
  const res = await api.get<DashboardStats>("/dashboard/stats");
  return res.data;
}

export async function fetchCharts() {
  const res = await api.get<DashboardCharts>("/dashboard/charts");
  return res.data;
}
