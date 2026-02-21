import { Bell, AlertTriangle, Calendar, Info } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";

const notifications = [
  { id: 1, type: "risk", title: "High risk alert for your region", description: "Water contamination levels have exceeded safe limits in West Region.", time: "30 minutes ago", level: "high" as const },
  { id: 2, type: "appointment", title: "Appointment confirmed", description: "Your appointment with Dr. Sarah Chen on Feb 23 at 10:00 AM has been confirmed.", time: "2 hours ago", level: "low" as const },
  { id: 3, type: "risk", title: "Dengue outbreak warning", description: "Cases of dengue fever have been reported in nearby areas. Take precautions.", time: "5 hours ago", level: "critical" as const },
  { id: 4, type: "info", title: "Medical record approved", description: "Your medical record for Seasonal Flu has been approved by Dr. Chen.", time: "1 day ago", level: "low" as const },
  { id: 5, type: "risk", title: "Moderate air quality advisory", description: "AQI levels are moderate in Central Region. Sensitive groups should limit outdoor activity.", time: "2 days ago", level: "medium" as const },
];

const iconMap = {
  risk: AlertTriangle,
  appointment: Calendar,
  info: Info,
};

export default function Notifications() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground">Stay updated with alerts and confirmations</p>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        {notifications.map((n, i) => {
          const Icon = iconMap[n.type as keyof typeof iconMap] || Bell;
          return (
            <div key={n.id} className={`flex gap-4 p-4 hover:bg-muted/30 transition-colors ${i < notifications.length - 1 ? "border-b" : ""}`}>
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${n.type === "risk" ? "bg-warning/10 text-warning" : n.type === "appointment" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  <RiskBadge level={n.level} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.description}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
