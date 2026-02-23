import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { analyticsService } from "@/services/analyticsService";
import type { RegionRisk } from "@/types";
import { Loader2 } from "lucide-react";

interface RegionMapProps {
  className?: string;
  onRegionClick?: (region: string) => void;
  highlightedRegion?: string;
}

// Region positions for the map visualization
const regionPositions: Record<string, { x: number; y: number }> = {
  Chennai_South: { x: 120, y: 220 },
  Chennai_Central: { x: 120, y: 130 },
  Coimbatore: { x: 220, y: 130 },
};

function getRiskColor(risk: number) {
  if (risk >= 75) return "fill-critical/70 stroke-critical";
  if (risk >= 50) return "fill-warning/70 stroke-warning";
  if (risk >= 25) return "fill-info/70 stroke-info";
  return "fill-success/70 stroke-success";
}

export function RegionMap({ className, onRegionClick, highlightedRegion }: RegionMapProps) {
  const [regions, setRegions] = useState<Array<{ id: string; name: string; x: number; y: number; risk: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegionData();
  }, []);

  const fetchRegionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getRegionalRisk();
      
      // Map API data to component format
      const mappedRegions = data.map((region: RegionRisk) => {
        const pos = regionPositions[region.region_id] || { x: 150, y: 150 };
        return {
          id: region.region_id,
          name: `${region.region_id.charAt(0).toUpperCase() + region.region_id.slice(1)} Region`,
          x: pos.x,
          y: pos.y,
          risk: region.risk_score,
        };
      });

      // If no data, use default regions with 0 risk
      if (mappedRegions.length === 0) {
        setRegions([
          { id: "Chennai_South", name: "Chennai South", x: 120, y: 220, risk: 0 },
          { id: "Chennai_Central", name: "Chennai Central", x: 120, y: 130, risk: 0 },
          { id: "Coimbatore", name: "Coimbatore", x: 220, y: 130, risk: 0 },
        ]);
      } else {
        setRegions(mappedRegions);
      }
    } catch (err: any) {
      console.warn("Could not fetch region data:", err);
      // Set default regions on error
      setRegions([
        { id: "Chennai_South", name: "Chennai South", x: 120, y: 220, risk: 0 },
        { id: "Chennai_Central", name: "Chennai Central", x: 120, y: 130, risk: 0 },
        { id: "Coimbatore", name: "Coimbatore", x: 220, y: 130, risk: 0 },
      ]);
      setError("Using default data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-card", className)}>
      <h3 className="mb-3 text-sm font-semibold">Regional Risk Heatmap</h3>
      
      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
