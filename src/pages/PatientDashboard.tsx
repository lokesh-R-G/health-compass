import { Activity, Droplets, CloudRain, Waves, Gauge, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "@/components/StatCard";
import { RiskBadge } from "@/components/RiskBadge";
import { RegionMap } from "@/components/RegionMap";

const trendData = [
  { day: "Mon", score: 42 },
  { day: "Tue", score: 48 },
  { day: "Wed", score: 55 },
  { day: "Thu", score: 52 },
  { day: "Fri", score: 60 },
  { day: "Sat", score: 58 },
  { day: "Sun", score: 62 },
];

const alerts = [
  { id: 1, title: "High waterborne disease risk in West Region", time: "2 hours ago", level: "high" as const },
  { id: 2, title: "Rainfall exceeding threshold in Central Region", time: "5 hours ago", level: "medium" as const },
  { id: 3, title: "Air quality advisory for North Region", time: "1 day ago", level: "low" as const },
];

export default function PatientDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h1 className="text-xl font-bold">Welcome back, User</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's your regional health overview for today.</p>
      </div>

      {/* Risk Score + Env Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-6 shadow-card lg:col-span-1 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">Risk Score</p>
          <p className="mt-2 text-5xl font-bold text-primary">62</p>
          <RiskBadge level="medium" className="mt-3" />
        </div>

        <StatCard title="Rainfall" value="45mm" icon={<CloudRain className="h-5 w-5" />} subtitle="Last 24h" />
        <StatCard title="Humidity" value="78%" icon={<Droplets className="h-5 w-5" />} subtitle="Current" />
        <StatCard title="Water pH" value="7.2" icon={<Waves className="h-5 w-5" />} subtitle="Safe range" variant="accent" />
        <StatCard title="TDS" value="320" icon={<Gauge className="h-5 w-5" />} subtitle="ppm" />
      </div>

      {/* Charts + Map */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Trend Chart */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold">Risk Trend (Last 7 Days)</h3>
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
        </div>

        {/* Map */}
        <RegionMap highlightedRegion="west" />
      </div>

      {/* Active Alerts */}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" /> Active Alerts
        </h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
              <RiskBadge level={alert.level} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
