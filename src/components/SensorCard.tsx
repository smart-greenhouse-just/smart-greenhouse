"use client";

import { LucideIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

interface SensorCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  status: "Optimal" | "Warning" | "Critical";
  statusText: string;
  colorClass: string;
  bgColorClass: string;
  historyData: { value: number }[];
  lastUpdated: string;
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
}: SensorCardProps) {
  const borderColors = {
    Optimal: "border-emerald-500/10 focus-within:ring-emerald-500/20",
    Warning: "border-amber-500/20 focus-within:ring-amber-500/20",
    Critical: "border-red-500/20 focus-within:ring-red-500/20",
  };

  const badgeColors = {
    Optimal: "bg-emerald-500/10 text-emerald-500",
    Warning: "bg-amber-500/10 text-amber-500",
    Critical: "bg-red-500/10 text-red-500",
  };

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${borderColors[status]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bgColorClass} ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-foreground transition-all duration-500">
          {value}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">{unit}</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColors[status]}`}>
          {status}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium">{statusText}</span>
      </div>

      <div className="mt-4 h-12 w-full overflow-hidden opacity-85">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={
                    status === "Optimal" ? "#10b981" : status === "Warning" ? "#f59e0b" : "#ef4444"
                  }
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor={
                    status === "Optimal" ? "#10b981" : status === "Warning" ? "#f59e0b" : "#ef4444"
                  }
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={
                status === "Optimal" ? "#10b981" : status === "Warning" ? "#f59e0b" : "#ef4444"
              }
              strokeWidth={1.5}
              fillOpacity={1}
              fill={`url(#gradient-${title.replace(/\s+/g, "")})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2.5 border-t border-border/50 pt-2 text-[9px] text-muted-foreground">
        Updated: {lastUpdated}
      </div>
    </div>
  );
}
