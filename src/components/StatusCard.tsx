"use client";

import { Wifi, Server, Database, Activity, Camera } from "lucide-react";
import { RealtimeState } from "@/services/realtime";

interface StatusCardProps {
  state: RealtimeState | null;
}

export function StatusCard({ state }: StatusCardProps) {
  const getSignalStrengthLabel = (strength: number) => {
    if (strength === -100) return "Offline";
    if (strength >= -60) return "Excellent";
    if (strength >= -75) return "Good";
    return "Fair";
  };

  const isOnline = state?.espStatus === "online";
  const isCameraOnline = state?.cameraStatus === "online";
  const wsOk = state?.mqttStatus === "connected";
  const dbOk = state?.dbStatus === "connected";

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
      status: isOnline ? `${state?.wifiStrength} dBm` : "Offline",
      detail: getSignalStrengthLabel(state?.wifiStrength ?? -100),
      icon: Wifi,
      color: isOnline ? "text-emerald-500" : "text-red-500",
      bgColor: isOnline ? "bg-emerald-500/10" : "bg-red-500/10",
      indicatorColor: isOnline ? "bg-emerald-500" : "bg-red-500",
    },
    {
      title: "ESP32 Camera",
      status: isCameraOnline ? "Online" : "Offline",
      detail: isCameraOnline ? "Stream Ready" : "Disconnected",
      icon: Camera,
      color: isCameraOnline ? "text-emerald-500" : "text-red-500",
      bgColor: isCameraOnline ? "bg-emerald-500/10" : "bg-red-500/10",
      indicatorColor: isCameraOnline ? "bg-emerald-500" : "bg-red-500",
    },
    {
      title: "WS Connection",
      status: wsOk ? "Active" : "Inactive",
      detail: wsOk ? `ws://localhost:${process.env.NEXT_PUBLIC_WS_PORT || "3001"}` : "Reconnecting daemon...",
      icon: Server,
      color: wsOk ? "text-emerald-500" : "text-amber-500",
      bgColor: wsOk ? "bg-emerald-500/10" : "bg-amber-500/10",
      indicatorColor: wsOk ? "bg-emerald-500" : "bg-amber-500",
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
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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

            <span className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              {item.detail}
            </span>
          </div>
        );
      })}
    </div>
  );
}
