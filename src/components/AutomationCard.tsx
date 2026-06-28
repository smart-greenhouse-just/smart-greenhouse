"use client";

import { useState } from "react";
import { Droplet, Sun, Wind, Lock, Unlock, ShieldAlert } from "lucide-react";
import { RealtimeState } from "@/services/realtime";

interface AutomationCardProps {
  state: RealtimeState | null;
  onToggle: (key: keyof RealtimeState["actuators"]) => void;
}

export function AutomationCard({ state, onToggle }: AutomationCardProps) {
  const [locks, setLocks] = useState<Record<string, boolean>>({
    pump: false,
    growLight: false,
    fan: false,
  });

  const [lastRun] = useState<Record<string, string>>({
    pump: "10 mins ago",
    growLight: "2 hours ago",
    fan: "Just now",
  });

  const toggleLock = (key: string) => {
    setLocks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const actuators = [
    {
      key: "pump" as keyof RealtimeState["actuators"],
      name: "Water Pump",
      icon: Droplet,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Automated drip irrigation node",
    },
    {
      key: "growLight" as keyof RealtimeState["actuators"],
      name: "Grow Light",
      icon: Sun,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Full spectrum PAR LED array",
    },
    {
      key: "fan" as keyof RealtimeState["actuators"],
      name: "Cooling Fan",
      icon: Wind,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      description: "12V intake/exhaust microclimates",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {actuators.map((act) => {
        const Icon = act.icon;
        const isActive = state?.actuators[act.key] ?? false;
        const isLocked = locks[act.key];

        return (
          <div
            key={act.key}
            className={`flex flex-col justify-between rounded-2xl border p-5 bg-card transition-all duration-300 ${
              isActive ? "border-emerald-500/20 shadow-sm" : "border-border/60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${act.bgColor} ${act.color}`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-bold text-foreground">{act.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{act.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => toggleLock(act.key)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer ${
                  isLocked ? "bg-red-500/5 border-red-500/10 text-red-500" : ""
                }`}
                title={isLocked ? "Unlock control panel" : "Lock control panel"}
              >
                {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Status:</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                  isActive ? "text-emerald-500" : "text-muted-foreground"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                  {isActive ? "ACTIVE" : "STANDBY"}
                </span>
              </div>

              <label className={`relative inline-flex items-center ${isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                <input
                  type="checkbox"
                  checked={isActive}
                  disabled={isLocked}
                  onChange={() => onToggle(act.key)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            <div className="mt-4.5 border-t border-border/50 pt-3 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Last Run: {isActive ? "Just now" : lastRun[act.key]}</span>
              {isLocked && (
                <span className="flex items-center gap-1 text-red-500 font-semibold uppercase tracking-wide">
                  <ShieldAlert className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
