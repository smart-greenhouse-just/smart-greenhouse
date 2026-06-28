"use client";

import { Activity, ToggleLeft, Camera, AlertTriangle } from "lucide-react";
import { ActivityLog } from "@/hooks/useGreenhouse";

interface TimelineProps {
  logs: ActivityLog[];
}

export function Timeline({ logs }: TimelineProps) {
  const getLogIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "actuator":
        return { icon: ToggleLeft, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "camera":
        return { icon: Camera, color: "text-purple-500", bg: "bg-purple-500/10" };
      case "alert":
        return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" };
      default:
        return { icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" };
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-4">
        <Activity className="h-4.5 w-4.5 text-primary" />
        <h2 className="font-sans text-xs font-bold text-foreground">Recent Event Logs</h2>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">No recent events.</div>
        ) : (
          logs.map((log) => {
            const style = getLogIcon(log.type);
            const Icon = style.icon;
            return (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/15 p-2.5 transition-colors hover:bg-muted/30"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate leading-snug">
                    {log.event}
                  </p>
                  <span className="text-[9px] text-muted-foreground font-semibold">
                    {log.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
