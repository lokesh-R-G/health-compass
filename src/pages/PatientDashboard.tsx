import { useEffect, useState } from "react";
import { Droplets, CloudRain, Waves, Gauge, AlertTriangle, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "@/components/StatCard";
import { RiskBadge } from "@/components/RiskBadge";
import { RegionMap } from "@/components/RegionMap";
import { useAuth } from "@/contexts/AuthContext";
import { patientService } from "@/services/patientService";
import { analyticsService } from "@/services/analyticsService";
import type { RiskTrend, EnvironmentalData, RegionRisk } from "@/types";

interface DashboardData {
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  trends: RiskTrend[];
  environmental: EnvironmentalData | null;
  alerts: Array<{
    id: string;
    title: string;
    time: string;
    level: "low" | "medium" | "high" | "critical";
  }>;
  highlightedRegion: string;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    riskScore: 0,
    riskLevel: "low",
    trends: [],
    environmental: null,
    alerts: [],
    highlightedRegion: "central",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard data from patient service
        const dashboardData = await patientService.getDashboardData();
        
        // Fetch regional risk for highlighted region
        let regionRisks: RegionRisk[] = [];
        try {
          regionRisks = await analyticsService.getRegionalRisk();
        } catch (e) {
          console.warn("Could not fetch regional risks:", e);
        }

        // Find highest risk region
        const highestRiskRegion = regionRisks.reduce(
          (max, region) => (region.risk_score > max.risk_score ? region : max),
          { region_id: "central", risk_score: 0 } as RegionRisk
        );

        // Get environmental data for user's region or default
        let envData: EnvironmentalData | null = null;
        try {
          const allEnvData = await analyticsService.getEnvironmentalData();
          envData = allEnvData[0] || null;
        } catch (e) {
          console.warn("Could not fetch environmental data:", e);
        }

        // Format alerts from dashboard data
        const formattedAlerts = (dashboardData.alerts || []).map((alert: any) => ({
          id: alert._id || alert.id || String(Math.random()),
          title: alert.message || alert.title,
          time: formatTimeAgo(new Date(alert.created_at || alert.timestamp)),
          level: alert.severity || alert.level || "medium",
        }));

        setData({
          riskScore: dashboardData.risk_score || 0,
          riskLevel: dashboardData.risk_level || "low",
          trends: dashboardData.trends || [],
          environmental: envData,
          alerts: formattedAlerts,
          highlightedRegion: highestRiskRegion.region_id || "central",
        });
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Format trends for chart
  const trendData = data.trends.map((t) => ({
    day: new Date(t.date).toLocaleDateString("en-US", { weekday: "short" }),
    score: t.risk_score,
  }));

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
          onClick={() => window.location.reload()}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h1 className="text-xl font-bold">Welcome back, {user?.name || "User"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's your regional health overview for today.</p>
      </div>

      {/* Risk Score + Env Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-6 shadow-card lg:col-span-1 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">Risk Score</p>
          <p className="mt-2 text-5xl font-bold text-primary">{data.riskScore}</p>
          <RiskBadge level={data.riskLevel} className="mt-3" />
        </div>

        <StatCard
          title="Rainfall"
          value={data.environmental ? `${data.environmental.rainfall}mm` : "N/A"}
          icon={<CloudRain className="h-5 w-5" />}
          subtitle="Last 24h"
        />
        <StatCard
          title="Humidity"
          value={data.environmental ? `${data.environmental.humidity}%` : "N/A"}
          icon={<Droplets className="h-5 w-5" />}
          subtitle="Current"
        />
        <StatCard
          title="Water pH"
          value={data.environmental ? String(data.environmental.water_ph) : "N/A"}
          icon={<Waves className="h-5 w-5" />}
          subtitle="Safe range"
          variant="accent"
        />
        <StatCard
          title="TDS"
          value={data.environmental ? String(data.environmental.tds) : "N/A"}
          icon={<Gauge className="h-5 w-5" />}
          subtitle="ppm"
        />
      </div>

      {/* Charts + Map */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Trend Chart */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold">Risk Trend (Last 7 Days)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-muted-foreground">
              No trend data available
            </div>
          )}
        </div>

        {/* Map */}
        <RegionMap highlightedRegion={data.highlightedRegion} />
      </div>

      {/* Active Alerts */}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" /> Active Alerts
        </h3>
        <div className="space-y-3">
          {data.alerts.length > 0 ? (
            data.alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
                <RiskBadge level={alert.level} />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No active alerts</p>
          )}
        </div>
      </div>
    </div>
  );
}
