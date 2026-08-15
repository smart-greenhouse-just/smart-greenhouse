"use client";

import { LucideIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface SensorCardProps {
  title: string;
  value?: number | string;
  unit: string;
  icon: LucideIcon;
  status: "Optimal" | "Warning" | "Critical" | "No Data";
  statusText: string;
  colorClass: string;
  bgColorClass: string;
  historyData: { value: number }[];
  lastUpdated: string;
  hideStatus?: boolean;
  totalSensors?: number;
  secondaryInfo?: string;
}

export function SensorCard({
  title,
  value,
  unit,
  icon: Icon,
  status,
  statusText,
  colorClass,
  bgColorClass,
  historyData,
  lastUpdated,
  hideStatus = false,
  totalSensors = 1,
  secondaryInfo,
}: SensorCardProps) {
  const borderColors: Record<string, string> = {
    Optimal: "border-emerald-500/10 focus-within:ring-emerald-500/20",
    Warning: "border-amber-500/20 focus-within:ring-amber-500/20",
    Critical: "border-red-500/20 focus-within:ring-red-500/20",
    "No Data": "border-border/60 focus-within:ring-primary/10",
  };

  const badgeColors: Record<string, string> = {
    Optimal: "bg-emerald-500/10 text-emerald-500",
    Warning: "bg-amber-500/10 text-amber-500",
    Critical: "bg-red-500/10 text-red-500",
    "No Data": "bg-muted text-muted-foreground",
  };

  const displayValue = value !== undefined && value !== null ? value : "--";

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        hideStatus ? "border-border/60 focus-within:ring-primary/10" : borderColors[status] || "border-border/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">{title}</span>
          {totalSensors > 1 && (
            <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
              {totalSensors} sensors (avg)
            </span>
          )}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bgColorClass} ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-foreground transition-all duration-500">
          {displayValue}
        </span>
        {displayValue !== "--" && (
          <span className="text-xs font-semibold text-muted-foreground">{unit}</span>
        )}
      </div>

      {!hideStatus && (
        <div className="mt-2 flex items-center justify-between">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColors[status] || badgeColors["No Data"]}`}>
            {status}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">{statusText}</span>
        </div>
      )}

      {historyData && historyData.length > 1 ? (
        <div className="mt-4 h-12 w-full overflow-hidden opacity-85">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={
                      status === "Optimal" ? "#10b981" : status === "Warning" ? "#f59e0b" : status === "Critical" ? "#ef4444" : "#64748b"
                    }
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={
                      status === "Optimal" ? "#10b981" : status === "Warning" ? "#f59e0b" : status === "Critical" ? "#ef4444" : "#64748b"
                    }
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={
                  status === "Optimal" ? "#10b981" : status === "Warning" ? "#f59e0b" : status === "Critical" ? "#ef4444" : "#64748b"
                }
                strokeWidth={1.5}
                fillOpacity={1}
                fill={`url(#gradient-${title.replace(/\s+/g, "")})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4 h-12 w-full flex items-center justify-center rounded-lg bg-muted/20 border border-dashed border-border/40">
          <span className="text-[10px] text-muted-foreground/60 font-medium">
            {displayValue === "--" ? "No telemetry recorded" : "Live stream active"}
          </span>
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[9px] text-muted-foreground">
        <span>Updated: {lastUpdated}</span>
        {secondaryInfo && (
          <span className="font-mono font-bold text-foreground/80 bg-muted/60 px-1.5 py-0.5 rounded tracking-tight">
            {secondaryInfo}
          </span>
        )}
      </div>
    </div>
  );
}
