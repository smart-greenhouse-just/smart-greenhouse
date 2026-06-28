"use client";

import { AlertCircle, AlertTriangle, ShieldCheck, X } from "lucide-react";
import { AlertItem } from "@/hooks/useGreenhouse";

interface AlertCardProps {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
}

export function AlertCard({ alerts, onDismiss }: AlertCardProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 dark:bg-emerald-500/10 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
          <ShieldCheck className="h-5.5 w-5.5" />
        </div>
        <div>
          <h3 className="font-sans text-sm font-bold text-foreground">All Systems Operational</h3>
          <p className="text-xs text-muted-foreground">
            Sensors are reporting within normal parameters. No immediate actions required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const isCritical = alert.severity === "critical";
        const Icon = isCritical ? AlertCircle : AlertTriangle;
        const colorBorder = isCritical ? "border-red-500/20" : "border-amber-500/20";
        const colorBg = isCritical ? "bg-red-500/5 dark:bg-red-500/10" : "bg-amber-500/5 dark:bg-amber-500/10";
        const colorText = isCritical ? "text-red-500" : "text-amber-500";
        const badgeBg = isCritical ? "bg-red-500/10" : "bg-amber-500/10";

        return (
          <div
            key={alert.id}
            className={`flex items-start justify-between rounded-2xl border p-5 transition-all duration-200 ${colorBorder} ${colorBg}`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${badgeBg} ${colorText}`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeBg} ${colorText}`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs font-bold text-foreground">{alert.sensor} Alert</span>
                </div>
                <p className="text-xs font-semibold text-foreground leading-relaxed">
                  {alert.message}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-bold">Recommended action:</span> {alert.suggestedAction}
                </p>
              </div>
            </div>

            <button
              onClick={() => onDismiss(alert.id)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
