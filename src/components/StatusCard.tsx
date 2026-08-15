"use client";

import { Wifi, Database, Activity } from "lucide-react";
import { RealtimeState } from "@/services/realtime";

interface StatusCardProps {
  state: RealtimeState | null;
}

function rssiToPercentage(rssi: number): number {
  if (rssi <= -100) return 0;
  if (rssi >= -50) return 100;
  return Math.min(100, Math.max(0, Math.round(2 * (rssi + 100))));
}

function getSignalQuality(rssi: number) {
  if (rssi <= -100) return { label: "Offline", quality: "Disconnected", color: "text-red-500", bg: "bg-red-500/10", indicatorColor: "bg-red-500" };
  const percent = rssiToPercentage(rssi);
  if (percent >= 75) return { label: "Excellent", quality: "Very Strong Signal", color: "text-emerald-500", bg: "bg-emerald-500/10", indicatorColor: "bg-emerald-500" };
  if (percent >= 55) return { label: "Good", quality: "Strong & Stable", color: "text-emerald-500", bg: "bg-emerald-500/10", indicatorColor: "bg-emerald-500" };
  if (percent >= 35) return { label: "Fair", quality: "Moderate Signal", color: "text-amber-500", bg: "bg-amber-500/10", indicatorColor: "bg-amber-500" };
  return { label: "Weak", quality: "Weak Connection", color: "text-red-500", bg: "bg-red-500/10", indicatorColor: "bg-red-500" };
}

export function StatusCard({ state }: StatusCardProps) {
  const isOnline = state?.espStatus === "online";
  const dbOk = state?.dbStatus === "connected";
  const wifiRssi = state?.wifiStrength ?? -100;
  const wifiPercent = isOnline ? rssiToPercentage(wifiRssi) : 0;
  const wifiQuality = isOnline ? getSignalQuality(wifiRssi) : getSignalQuality(-100);

  const systemMetrics = [
    {
      title: "ESP32 Controller",
      status: isOnline ? "Online" : "Offline",
      detail: isOnline ? "Handshake Active" : "Disconnected",
      icon: Activity,
      color: isOnline ? "text-emerald-500" : "text-red-500",
      bgColor: isOnline ? "bg-emerald-500/10" : "bg-red-500/10",
      indicatorColor: isOnline ? "bg-emerald-500" : "bg-red-500",
    },
    {
      title: "WiFi Strength",
      status: isOnline ? `${wifiPercent}%` : "Offline",
      detail: isOnline ? `${wifiQuality.quality} (${wifiRssi} dBm)` : "No Active Signal",
      icon: Wifi,
      color: wifiQuality.color,
      bgColor: wifiQuality.bg,
      indicatorColor: wifiQuality.indicatorColor,
      progressPercent: isOnline ? wifiPercent : 0,
    },
    {
      title: "Database Status",
      status: dbOk ? "Connected" : "Disconnected",
      detail: dbOk ? "MongoDB Client Ready" : "Retrying local connection",
      icon: Database,
      color: dbOk ? "text-emerald-500" : "text-red-500",
      bgColor: dbOk ? "bg-emerald-500/10" : "bg-red-500/10",
      indicatorColor: dbOk ? "bg-emerald-500" : "bg-red-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
      {systemMetrics.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                {item.title}
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.bgColor} ${item.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                {item.status}
              </span>
              <span className="inline-flex h-2 w-2 rounded-full relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.indicatorColor}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${item.indicatorColor}`} />
              </span>
            </div>

            {item.progressPercent !== undefined && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.progressPercent >= 70
                      ? "bg-emerald-500"
                      : item.progressPercent >= 40
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${item.progressPercent}%` }}
                />
              </div>
            )}

            <span className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
              {item.detail}
            </span>
          </div>
        );
      })}
    </div>
  );
}
