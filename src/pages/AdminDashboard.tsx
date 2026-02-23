import { useEffect, useState } from "react";
import { Users, Activity, AlertTriangle, Droplets, CloudRain, Thermometer, Loader2 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { RegionMap } from "@/components/RegionMap";
import { RiskBadge } from "@/components/RiskBadge";
import { analyticsService } from "@/services/analyticsService";
import type { RegionRisk, RiskTrend, EnvironmentalData } from "@/types";

interface AdminDashboardData {
  totalPatients: number;
  casesToday: number;
  activeAlerts: number;
  avgRiskScore: number;
  casesTrend: Array<{ date: string; cases: number }>;
  diseaseDistribution: Array<{ name: string; value: number }>;
  regionRisks: RegionRisk[];
  waterQuality: Array<{ region: string; ph: number; tds: number }>;
  weather: {
    rainfall: number;
    humidity: number;
    temperature: number;
    airQuality: string;
  };
}

const pieColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminDashboardData>({
    totalPatients: 0,
    casesToday: 0,
    activeAlerts: 0,
    avgRiskScore: 0,
    casesTrend: [],
    diseaseDistribution: [],
    regionRisks: [],
    waterQuality: [],
    weather: { rainfall: 0, humidity: 0, temperature: 0, airQuality: "N/A" },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [riskOverview, regionalRisks, envData, trends, diseaseData] = await Promise.all([
        analyticsService.getAdminRiskOverview(),
        analyticsService.getRegionalRisk(),
        analyticsService.getEnvironmentalData(),
        analyticsService.getTrends(),
        analyticsService.getDiseaseDistribution(),
      ]);

      // Format case trends
      const casesTrend = (trends || []).map((t: RiskTrend) => ({
        date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        cases: t.total_cases || 0,
      }));

      // Format disease distribution
      const diseaseDistribution = Object.entries(diseaseData || {}).map(([name, value]) => ({
        name,
        value: value as number,
      }));

      // Format water quality from environmental data
      const waterQuality = (envData || []).map((e: EnvironmentalData) => ({
        region: e.region_id,
        ph: e.water_ph,
        tds: e.tds,
      }));

      // Calculate averages for weather
      const avgWeather = {
        rainfall: envData.length
          ? envData.reduce((sum: number, e: EnvironmentalData) => sum + (e.rainfall || 0), 0) / envData.length
          : 0,
        humidity: envData.length
          ? envData.reduce((sum: number, e: EnvironmentalData) => sum + (e.humidity || 0), 0) / envData.length
          : 0,
        temperature: envData.length
          ? envData.reduce((sum: number, e: EnvironmentalData) => sum + (e.temperature || 28), 0) / envData.length
          : 28,
        airQuality: "Good",
      };

      // Calculate average risk score
      const avgRisk = regionalRisks.length
        ? regionalRisks.reduce((sum: number, r: RegionRisk) => sum + r.risk_score, 0) / regionalRisks.length
        : 0;

      setData({
        totalPatients: riskOverview.total_patients || 0,
        casesToday: riskOverview.cases_today || 0,
        activeAlerts: riskOverview.active_alerts || 0,
        avgRiskScore: Math.round(avgRisk),
        casesTrend,
        diseaseDistribution,
        regionRisks: regionalRisks,
        waterQuality,
        weather: avgWeather,
      });
    } catch (err: any) {
      console.error("Failed to fetch admin dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelLabel = (score: number): string => {
    if (score >= 75) return "Critical";
    if (score >= 50) return "High";
    if (score >= 25) return "Medium";
    return "Low";
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6">
        <h2 className="text-lg font-semibold text-destructive">Error Loading Dashboard</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Regional health intelligence overview</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={data.totalPatients.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Cases Today"
          value={data.casesToday.toString()}
          icon={<Activity className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title="Active Alerts"
          value={data.activeAlerts.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="critical"
        />
        <StatCard
          title="Avg Risk Score"
          value={data.avgRiskScore.toString()}
          subtitle={getRiskLevelLabel(data.avgRiskScore)}
          variant="primary"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cases Trend */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold">Cases Over Time</h3>
          {data.casesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.casesTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="cases" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">
              No trend data available
            </div>
          )}
        </div>

        {/* Disease Distribution */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold">Disease Distribution</h3>
          {data.diseaseDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.diseaseDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {data.diseaseDistribution.map((_, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">
              No disease data available
            </div>
          )}
        </div>
      </div>

      {/* Map + Risk Table */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RegionMap />

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold">Risk Score by Region</h3>
          {data.regionRisks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Region</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Score</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Level</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {data.regionRisks.map((r) => (
                    <tr key={r.region_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 font-medium capitalize">{r.region_id}</td>
                      <td className="px-3 py-2.5">{r.risk_score}</td>
                      <td className="px-3 py-2.5"><RiskBadge level={r.risk_level || "low"} /></td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.total_cases || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No regional risk data available</p>
          )}
        </div>
      </div>

      {/* Water & Weather */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <Droplets className="h-4 w-4 text-info" /> Water Quality Indicators
          </h3>
          {data.waterQuality.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.waterQuality}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="region" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="ph" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="pH Level" />
                <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No water quality data available
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-info" /> Weather Indicators
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <CloudRain className="mx-auto h-6 w-6 text-info" />
              <p className="mt-2 text-lg font-bold">{Math.round(data.weather.rainfall)}mm</p>
              <p className="text-xs text-muted-foreground">Avg Rainfall</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Droplets className="mx-auto h-6 w-6 text-info" />
              <p className="mt-2 text-lg font-bold">{Math.round(data.weather.humidity)}%</p>
              <p className="text-xs text-muted-foreground">Avg Humidity</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Thermometer className="mx-auto h-6 w-6 text-warning" />
              <p className="mt-2 text-lg font-bold">{Math.round(data.weather.temperature)}°C</p>
              <p className="text-xs text-muted-foreground">Temperature</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Activity className="mx-auto h-6 w-6 text-success" />
              <p className="mt-2 text-lg font-bold">{data.weather.airQuality}</p>
              <p className="text-xs text-muted-foreground">Air Quality</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
