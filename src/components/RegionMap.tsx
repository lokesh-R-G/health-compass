import { cn } from "@/lib/utils";

interface RegionMapProps {
  className?: string;
  onRegionClick?: (region: string) => void;
  highlightedRegion?: string;
}

const regions = [
  { id: "north", name: "North Region", x: 120, y: 40, risk: 72 },
  { id: "south", name: "South Region", x: 120, y: 220, risk: 35 },
  { id: "east", name: "East Region", x: 220, y: 130, risk: 58 },
  { id: "west", name: "West Region", x: 30, y: 130, risk: 85 },
  { id: "central", name: "Central Region", x: 120, y: 130, risk: 45 },
];

function getRiskColor(risk: number) {
  if (risk >= 75) return "fill-critical/70 stroke-critical";
  if (risk >= 50) return "fill-warning/70 stroke-warning";
  if (risk >= 25) return "fill-info/70 stroke-info";
  return "fill-success/70 stroke-success";
}

export function RegionMap({ className, onRegionClick, highlightedRegion }: RegionMapProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-card", className)}>
      <h3 className="mb-3 text-sm font-semibold">Regional Risk Heatmap</h3>
      <svg viewBox="0 0 300 300" className="w-full max-w-md mx-auto">
        <rect x="0" y="0" width="300" height="300" rx="12" className="fill-muted/50" />
        {regions.map((r) => (
          <g
            key={r.id}
            onClick={() => onRegionClick?.(r.id)}
            className="cursor-pointer transition-opacity hover:opacity-80"
          >
            <circle
              cx={r.x}
              cy={r.y}
              r={38}
              className={cn(
                getRiskColor(r.risk),
                "stroke-[1.5] transition-all",
                highlightedRegion === r.id && "stroke-[3] opacity-100"
              )}
              opacity={highlightedRegion && highlightedRegion !== r.id ? 0.4 : 0.8}
            />
            <text x={r.x} y={r.y - 6} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
              {r.name.replace(" Region", "")}
            </text>
            <text x={r.x} y={r.y + 10} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
              {r.risk}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-success" /> Low</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-info" /> Medium</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-warning" /> High</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-critical" /> Critical</span>
      </div>
    </div>
  );
}
