import { Users, Activity, AlertTriangle, Droplets, CloudRain, Thermometer } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { RegionMap } from "@/components/RegionMap";
import { RiskBadge } from "@/components/RiskBadge";

const casesTrend = [
  { date: "Feb 15", cases: 120 },
  { date: "Feb 16", cases: 145 },
  { date: "Feb 17", cases: 132 },
  { date: "Feb 18", cases: 168 },
  { date: "Feb 19", cases: 155 },
  { date: "Feb 20", cases: 190 },
  { date: "Feb 21", cases: 178 },
];

const diseaseDistribution = [
  { name: "Dengue", value: 35 },
  { name: "Malaria", value: 25 },
  { name: "Typhoid", value: 20 },
  { name: "Cholera", value: 12 },
  { name: "Other", value: 8 },
];

const pieColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const regionRisks = [
  { region: "North", score: 72, level: "high" as const, cases: 45 },
  { region: "South", score: 35, level: "low" as const, cases: 12 },
  { region: "East", score: 58, level: "medium" as const, cases: 28 },
  { region: "West", score: 85, level: "critical" as const, cases: 67 },
  { region: "Central", score: 45, level: "medium" as const, cases: 22 },
];

const waterQuality = [
  { region: "North", ph: 7.1, tds: 290 },
  { region: "South", ph: 7.4, tds: 180 },
  { region: "East", ph: 6.8, tds: 420 },
  { region: "West", ph: 6.5, tds: 510 },
  { region: "Central", ph: 7.2, tds: 320 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Regional health intelligence overview</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value="12,847" icon={<Users className="h-5 w-5" />} trend={{ value: 5.2, positive: true }} />
        <StatCard title="Cases Today" value="178" icon={<Activity className="h-5 w-5" />} trend={{ value: 12, positive: false }} variant="warning" />
        <StatCard title="Active Alerts" value="7" icon={<AlertTriangle className="h-5 w-5" />} variant="critical" />
        <StatCard title="Avg Risk Score" value="59" subtitle="Moderate" variant="primary" />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cases Trend */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold">Cases Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={casesTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="cases" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Disease Distribution */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold">Disease Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={diseaseDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {diseaseDistribution.map((_, index) => (
                  <Cell key={index} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Map + Risk Table */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RegionMap />

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold">Risk Score by Region</h3>
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
                {regionRisks.map((r) => (
                  <tr key={r.region} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2.5 font-medium">{r.region}</td>
                    <td className="px-3 py-2.5">{r.score}</td>
                    <td className="px-3 py-2.5"><RiskBadge level={r.level} /></td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.cases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Water & Weather */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <Droplets className="h-4 w-4 text-info" /> Water Quality Indicators
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={waterQuality}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="region" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="ph" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="pH Level" />
              <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-info" /> Weather Indicators
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <CloudRain className="mx-auto h-6 w-6 text-info" />
              <p className="mt-2 text-lg font-bold">45mm</p>
              <p className="text-xs text-muted-foreground">Avg Rainfall</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Droplets className="mx-auto h-6 w-6 text-info" />
              <p className="mt-2 text-lg font-bold">78%</p>
              <p className="text-xs text-muted-foreground">Avg Humidity</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Thermometer className="mx-auto h-6 w-6 text-warning" />
              <p className="mt-2 text-lg font-bold">32°C</p>
              <p className="text-xs text-muted-foreground">Temperature</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <Activity className="mx-auto h-6 w-6 text-success" />
              <p className="mt-2 text-lg font-bold">Good</p>
              <p className="text-xs text-muted-foreground">Air Quality</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
