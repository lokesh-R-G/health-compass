import apiClient from "@/lib/api";
import type {
  RegionRisk,
  RiskTrendPoint,
  RiskTrend,
  AdminDashboardData,
  EnvironmentalData,
  DiseaseDistribution,
} from "@/types";

export const analyticsService = {
  /**
   * Get regional risk data
   */
  getRegionalRisk: async (): Promise<RegionRisk[]> => {
    const response = await apiClient.get<RegionRisk[]>("/region/risk");
    return response.data;
  },

  /**
   * Get risk trend data
   */
  getTrends: async (region?: string, days?: number): Promise<RiskTrend[]> => {
    const params = new URLSearchParams();
    if (region) params.append("region", region);
    if (days) params.append("days", days.toString());
    
    const response = await apiClient.get<RiskTrend[]>(`/region/trend?${params.toString()}`);
    return response.data;
  },

  /**
   * Get admin dashboard overview
   */
  getAdminRiskOverview: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get<AdminDashboardData>("/admin/risk-overview");
    return response.data;
  },

  /**
   * Get disease distribution
   */
  getDiseaseDistribution: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get<DiseaseDistribution[]>("/analytics/diseases");
    // Convert array to object for backward compatibility
    const result: Record<string, number> = {};
    response.data.forEach((item) => {
      result[item.disease] = item.count;
    });
    return result;
  },

  /**
   * Get environmental data
   */
  getEnvironmentalData: async (region?: string): Promise<EnvironmentalData[]> => {
    const params = region ? `?region=${region}` : "";
    const response = await apiClient.get<EnvironmentalData[]>(`/analytics/environmental${params}`);
    return response.data;
  },

  /**
   * Get patient regional risk (for patient dashboard)
   */
  getPatientRegionalRisk: async (): Promise<{
    risk_score: number;
    risk_level: string;
    region: string;
    rainfall: number;
    humidity: number;
    water_ph: number;
    water_tds: number;
  }> => {
    const response = await apiClient.get("/patient/regional-risk");
    return response.data;
  },
};
