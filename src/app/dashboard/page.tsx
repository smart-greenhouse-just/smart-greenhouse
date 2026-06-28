"use client";

import { useGreenhouse } from "@/hooks/useGreenhouse";
import { StatusCard } from "@/components/StatusCard";
import { SensorCard } from "@/components/SensorCard";
import { CameraCard } from "@/components/CameraCard";
import { AutomationCard } from "@/components/AutomationCard";
import { AlertCard } from "@/components/AlertCard";
import { Timeline } from "@/components/Timeline";
import {
  Thermometer,
  Droplets,
  Sprout,
  Sun,
  Heart,
  TrendingUp,
  Smile,
  LayoutDashboard,
  Sliders,
  Camera,
  ClipboardList,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const {
    state,
    alerts,
    logs,
    capturedImage,
    isCapturing,
    isAnalyzing,
    streamActive,
    streamFrame,
    toggleActuator,
    dismissAlert,
    startStream,
    stopStream,
    captureImage,
    analyzeImage,
    deleteImage,
  } = useGreenhouse();

  const [history, setHistory] = useState<Record<string, { value: number }[]>>({});
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!state) return;
    const sensors = state.sensors;
    
    const timer = setTimeout(() => {
      setHistory((prev) => {
        const updateList = (key: string, newVal: number) => {
          const list = prev[key] || Array.from({ length: 8 }, () => ({ value: newVal + (Math.random() - 0.5) * 2 }));
          const nextList = [...list.slice(1), { value: newVal }];
          return nextList;
        };

        return {
          temp: updateList("temp", sensors.temperature),
          hum: updateList("hum", sensors.humidity),
          soil: updateList("soil", sensors.soilMoisture),
          light: updateList("light", sensors.lightIntensity),
        };
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [state]);

  if (!state) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 py-6">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-card" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-2xl bg-card" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 h-96 animate-pulse rounded-2xl bg-card" />
        </div>
      </div>
    );
  }

  const s = state.sensors;

  const getTemperatureStatus = (t: number) => {
    if (t < 18) return { status: "Critical" as const, text: "Too Cold (Under 18°C)", color: "text-red-500", bg: "bg-red-500/10" };
    if (t <= 28) return { status: "Optimal" as const, text: "Ideal Range (18-28°C)", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (t <= 32) return { status: "Warning" as const, text: "Approaching Limits", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { status: "Critical" as const, text: "Overheating (Above 32°C)", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const getHumidityStatus = (h: number) => {
    if (h < 40) return { status: "Critical" as const, text: "Air dry (Under 40%)", color: "text-red-500", bg: "bg-red-500/10" };
    if (h <= 75) return { status: "Optimal" as const, text: "Ideal Transpiration", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (h <= 85) return { status: "Warning" as const, text: "High condensation risk", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { status: "Critical" as const, text: "Fungal mold risk (Above 85%)", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const getSoilStatus = (sm: number) => {
    if (sm < 25) return { status: "Critical" as const, text: "Wilting point danger", color: "text-red-500", bg: "bg-red-500/10" };
    if (sm <= 65) return { status: "Optimal" as const, text: "Excellent root moisture", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (sm <= 80) return { status: "Warning" as const, text: "Saturated rootzone", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { status: "Critical" as const, text: "Anaerobic soil drowning", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const getLightStatus = (l: number) => {
    if (l < 50) return { status: "Warning" as const, text: "Low photosynthesis rate", color: "text-amber-500", bg: "bg-amber-500/10" };
    if (l <= 900) return { status: "Optimal" as const, text: "Healthy growth light", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    return { status: "Warning" as const, text: "Excess light heat exposure", color: "text-amber-500", bg: "bg-amber-500/10" };
  };

  const tempObj = getTemperatureStatus(s.temperature);
  const humObj = getHumidityStatus(s.humidity);
  const soilObj = getSoilStatus(s.soilMoisture);
  const lightObj = getLightStatus(s.lightIntensity);

  const scoreDeductions = 
    (tempObj.status !== "Optimal" ? 10 : 0) +
    (humObj.status !== "Optimal" ? 8 : 0) +
    (soilObj.status !== "Optimal" ? 15 : 0);
  const healthScore = Math.max(40, 100 - scoreDeductions);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-sans text-xl font-extrabold text-foreground tracking-tight">Greenhouse Cockpit</h1>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          Node ID: esp32-greenhouse-01 • Realtime Stream
        </p>
      </div>

      <StatusCard state={state} />

      <div className="flex border-b border-border/80 gap-1 pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab("controls")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === "controls"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="h-4 w-4" />
          Actuators
        </button>
        <button
          onClick={() => setActiveTab("camera")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === "camera"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Camera className="h-4 w-4" />
          Camera & AI
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            activeTab === "logs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Alarms & Logs
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SensorCard
              title="Air Temperature"
              value={s.temperature}
              unit="°C"
              icon={Thermometer}
              status={tempObj.status}
              statusText={tempObj.text}
              colorClass={tempObj.color}
              bgColorClass={tempObj.bg}
              historyData={history.temp || []}
              lastUpdated={new Date(s.timestamp).toLocaleTimeString()}
            />
            <SensorCard
              title="Air Humidity"
              value={s.humidity}
              unit="%"
              icon={Droplets}
              status={humObj.status}
              statusText={humObj.text}
              colorClass={humObj.color}
              bgColorClass={humObj.bg}
              historyData={history.hum || []}
              lastUpdated={new Date(s.timestamp).toLocaleTimeString()}
            />
            <SensorCard
              title="Soil Moisture"
              value={s.soilMoisture}
              unit="%"
              icon={Sprout}
              status={soilObj.status}
              statusText={soilObj.text}
              colorClass={soilObj.color}
              bgColorClass={soilObj.bg}
              historyData={history.soil || []}
              lastUpdated={new Date(s.timestamp).toLocaleTimeString()}
            />
            <SensorCard
              title="Light Intensity"
              value={s.lightIntensity}
              unit="Lux"
              icon={Sun}
              status={lightObj.status}
              statusText={lightObj.text}
              colorClass={lightObj.color}
              bgColorClass={lightObj.bg}
              historyData={history.light || []}
              lastUpdated={new Date(s.timestamp).toLocaleTimeString()}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-red-500" /> Environmental Health
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">COMPOSITE INDEX</span>
              </div>
              <div className="flex items-center gap-6 py-2">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="34" className="stroke-muted" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className="stroke-primary transition-all duration-500"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray="213.6"
                      strokeDashoffset={213.6 - (213.6 * healthScore) / 100}
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-foreground">{healthScore}%</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-foreground">
                    {healthScore >= 85 ? "Excellent Status" : healthScore >= 70 ? "Stable Status" : "Action Required"}
                  </h4>
                  <p className="text-[10.5px] text-muted-foreground font-medium leading-normal">
                    Composite score aggregated across temperature, air humidity, soil hydration, and light levels.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Smile className="h-4 w-4 text-amber-500" /> Comfort Indicator
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">PHOTOSYNTHESIS INDEX</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Vapor Pressure Deficit:</span>
                  <span className="text-foreground">1.14 kPa <span className="text-emerald-500 font-bold">(Ideal)</span></span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Dew Point Temperature:</span>
                  <span className="text-foreground">15.8 °C</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Microclimate Comfort:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-bold uppercase tracking-wider text-[9px]">
                    <TrendingUp className="h-3.5 w-3.5" /> High Yield
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "controls" && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex flex-col gap-1 border-b border-border/40 pb-3">
            <h2 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">Actuator Manual Overrides</h2>
            <p className="text-xs text-muted-foreground">Override ESP32 automatic thresholds manually</p>
          </div>
          <AutomationCard state={state} onToggle={toggleActuator} />
        </div>
      )}

      {activeTab === "camera" && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex flex-col gap-1 border-b border-border/40 pb-3">
            <h2 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">ESP32 Camera Stream</h2>
            <p className="text-xs text-muted-foreground">Real-time video feed and AI leaf health diagnostics</p>
          </div>
          <CameraCard
            cameraOnline={state?.cameraStatus === "online"}
            streamActive={streamActive}
            streamFrame={streamFrame}
            capturedImage={capturedImage}
            isCapturing={isCapturing}
            isAnalyzing={isAnalyzing}
            onStartStream={startStream}
            onStopStream={stopStream}
            onCaptureImage={captureImage}
            onAnalyzeImage={analyzeImage}
            onDeleteImage={deleteImage}
          />
        </div>
      )}

      {activeTab === "logs" && (
        <div className="space-y-6 max-w-4xl">
          <div className="space-y-3">
            <h2 className="font-sans text-xs font-bold text-foreground uppercase tracking-wider">Active Alarms</h2>
            <AlertCard alerts={alerts} onDismiss={dismissAlert} />
          </div>
          <div className="space-y-3">
            <Timeline logs={logs} />
          </div>
        </div>
      )}
    </div>
  );
}
