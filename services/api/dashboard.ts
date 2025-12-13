/**
 * Dashboard API endpoints
 */

import { apiClient } from "./client";
import { ApiResponse } from "./types";

export interface DashboardTransaction {
  id: number;
  name: string;
  date: string;
  amount: string;
  status: "Confirmed" | "Pending" | "Failed";
}

export interface DashboardData {
  total_balance_ngn: number;
  transactions: DashboardTransaction[];
}

export const dashboardApi = {
  /**
   * Get dashboard data
   */
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>("/dashboard");
    return response.data;
  },
};

