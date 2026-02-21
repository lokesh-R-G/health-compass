import { cn } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected" | "confirmed" | "cancelled";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const styles: Record<Status, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  confirmed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize", styles[status], className)}>
      {status}
    </span>
  );
}
