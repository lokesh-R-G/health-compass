import { useState, useEffect } from "react";
import { Bell, AlertTriangle, Calendar, Info, Loader2, AlertCircle, Check, CheckCheck } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { notificationService } from "@/services/notificationService";
import type { Notification } from "@/types";

const iconMap = {
  risk: AlertTriangle,
  appointment: Calendar,
  info: Info,
  alert: AlertTriangle,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      console.error("Failed to fetch notifications:", err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setMarkingRead(notificationId);
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err: any) {
      console.error("Failed to mark as read:", err);
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAllRead(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err: any) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading notifications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6">
        <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> Error Loading Notifications
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={fetchNotifications}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay updated with alerts and confirmations</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {markingAllRead ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          {notifications.map((n, i) => {
            const Icon = iconMap[n.type as keyof typeof iconMap] || Bell;
            return (
              <div
                key={n._id}
                className={`flex gap-4 p-4 hover:bg-muted/30 transition-colors ${i < notifications.length - 1 ? "border-b" : ""} ${!n.read ? "bg-primary/5" : ""}`}
              >
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${n.type === "risk" || n.type === "alert" ? "bg-warning/10 text-warning" : n.type === "appointment" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!n.read ? "font-semibold" : ""}`}>{n.title}</p>
                    <RiskBadge level={n.severity || "low"} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(n.created_at)}</p>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkAsRead(n._id!)}
                        disabled={markingRead === n._id}
                        className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        {markingRead === n._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
