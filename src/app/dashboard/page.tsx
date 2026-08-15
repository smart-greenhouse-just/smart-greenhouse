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
    if (!state?.sensors) return;
    const sensors = state.sensors;
    if (sensors.temperature === undefined && sensors.humidity === undefined) return;
    
    const timer = setTimeout(() => {
      setHistory((prev) => {
        const updateList = (key: string, newVal: number | undefined) => {
          if (newVal === undefined) return prev[key] || [];
          const list = prev[key] || [];
          const nextList = [...list.slice(list.length >= 10 ? 1 : 0), { value: newVal }];
          return nextList;
        };

        const rawLight = sensors.lightIntensity;
        const lightPct = rawLight !== undefined
          ? Math.min(100, Math.max(0, Math.round(((3400 - rawLight) / 3400) * 100)))
          : undefined;

        return {
          temp: updateList("temp", sensors.temperature),
          hum: updateList("hum", sensors.humidity),
          soil: updateList("soil", sensors.soilMoisture),
          light: updateList("light", lightPct),
        };
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [state?.sensors]);

  if (!state) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 py-6">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-card" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
  const hasSensors = s && (s.temperature !== undefined || s.humidity !== undefined);

  const getTemperatureStatus = (t?: number) => {
    if (t === undefined) return { status: "No Data" as const, text: "Awaiting telemetry stream", color: "text-muted-foreground", bg: "bg-muted/40" };
    if (t < 18) return { status: "Critical" as const, text: "Too Cold (Under 18°C)", color: "text-red-500", bg: "bg-red-500/10" };
    if (t <= 28) return { status: "Optimal" as const, text: "Ideal Range (18-28°C)", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (t <= 32) return { status: "Warning" as const, text: "Approaching Limits", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { status: "Critical" as const, text: "Overheating (Above 32°C)", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const getHumidityStatus = (h?: number) => {
    if (h === undefined) return { status: "No Data" as const, text: "Awaiting telemetry stream", color: "text-muted-foreground", bg: "bg-muted/40" };
    if (h < 40) return { status: "Critical" as const, text: "Air dry (Under 40%)", color: "text-red-500", bg: "bg-red-500/10" };
    if (h <= 75) return { status: "Optimal" as const, text: "Ideal Transpiration", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (h <= 85) return { status: "Warning" as const, text: "High condensation risk", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { status: "Critical" as const, text: "Fungal mold risk (Above 85%)", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const getSoilStatus = (sm?: number) => {
    if (sm === undefined) return { status: "No Data" as const, text: "Awaiting telemetry stream", color: "text-muted-foreground", bg: "bg-muted/40" };
    if (sm < 25) return { status: "Critical" as const, text: "Wilting point danger", color: "text-red-500", bg: "bg-red-500/10" };
    if (sm <= 65) return { status: "Optimal" as const, text: "Excellent root moisture", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (sm <= 80) return { status: "Warning" as const, text: "Saturated rootzone", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { status: "Critical" as const, text: "Anaerobic soil drowning", color: "text-red-500", bg: "bg-red-500/10" };
  };

  const getLightStatus = (raw?: number) => {
    if (raw === undefined) return { status: "No Data" as const, text: "Awaiting telemetry stream", color: "text-muted-foreground", bg: "bg-muted/40" };
    if (raw >= 3400) return { status: "Warning" as const, text: "Light ON (Dark Ambient)", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { status: "Optimal" as const, text: "Light OFF (Adequate Light)", color: "text-emerald-500", bg: "bg-emerald-500/10" };
  };

  const tempObj = getTemperatureStatus(s.temperature);
  const humObj = getHumidityStatus(s.humidity);
  const soilObj = getSoilStatus(s.soilMoisture);
  const rawLdr = s.lightIntensity;
  const lightPercent = rawLdr !== undefined
    ? Math.min(100, Math.max(0, Math.round(((3400 - rawLdr) / 3400) * 100)))
    : undefined;

  const lightObj = getLightStatus(rawLdr);

  const scoreDeductions = hasSensors
    ? (tempObj.status !== "Optimal" ? 15 : 0) +
      (humObj.status !== "Optimal" ? 15 : 0) +
      (soilObj.status !== "Optimal" ? 20 : 0) +
      (lightObj.status !== "Optimal" ? 10 : 0)
    : 0;
  const healthScore = hasSensors ? Math.max(35, 100 - scoreDeductions) : 0;

  // Dynamic VPD and Dew Point calculation
  let vpdText = "--";
  let dewPointText = "--";
  if (s.temperature !== undefined && s.humidity !== undefined) {
    const T = s.temperature;
    const H = s.humidity;
    const vpSat = 0.61078 * Math.exp((17.27 * T) / (T + 237.3));
    const vpAct = vpSat * (H / 100);
    const vpd = Math.max(0, vpSat - vpAct);
    vpdText = `${vpd.toFixed(2)} kPa`;

    const a = 17.27;
    const b = 237.3;
    const alpha = (a * T) / (b + T) + Math.log(H / 100);
    const dew = (b * alpha) / (a - alpha);
    dewPointText = `${dew.toFixed(1)} °C`;
  }

  const lastUpdatedFormatted = s.timestamp ? new Date(s.timestamp).toLocaleTimeString() : "No telemetry recorded";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-sans text-xl font-extrabold text-foreground tracking-tight">Greenhouse Cockpit</h1>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          Node ID: esp32-greenhouse-01 • Multi-Sensor Realtime Stream
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
              lastUpdated={lastUpdatedFormatted}
              totalSensors={state.sensorDetails?.temperature?.totalSensors}
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
              lastUpdated={lastUpdatedFormatted}
              totalSensors={state.sensorDetails?.humidity?.totalSensors}
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
              lastUpdated={lastUpdatedFormatted}
              totalSensors={state.sensorDetails?.soilMoisture?.totalSensors}
            />
            <SensorCard
              title="Light Intensity"
              value={lightPercent}
              unit="%"
              icon={Sun}
              status={lightObj.status}
              statusText={lightObj.text}
              colorClass={lightObj.color}
              bgColorClass={lightObj.bg}
              historyData={history.light || []}
              lastUpdated={lastUpdatedFormatted}
              secondaryInfo={rawLdr !== undefined ? `Raw ADC: ${rawLdr}` : undefined}
              totalSensors={state.sensorDetails?.lightIntensity?.totalSensors}
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
                      strokeDashoffset={hasSensors ? 213.6 - (213.6 * healthScore) / 100 : 213.6}
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-foreground">
                    {hasSensors ? `${healthScore}%` : "--"}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-foreground">
                    {!hasSensors
                      ? "Standby Mode"
                      : healthScore >= 85
                      ? "Excellent Status"
                      : healthScore >= 70
                      ? "Stable Status"
                      : "Action Required"}
                  </h4>
                  <p className="text-[10.5px] text-muted-foreground font-medium leading-normal">
                    {hasSensors
                      ? "Composite score aggregated across temperature, air humidity, soil hydration, lighting, water levels, and air purity."
                      : "Awaiting telemetry stream from ESP32 node. Connect hardware to compute live health metrics."}
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
                  <span className="text-foreground">
                    {vpdText} {vpdText !== "--" && <span className="text-emerald-500 font-bold">(Calculated)</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Dew Point Temperature:</span>
                  <span className="text-foreground">{dewPointText}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Microclimate Comfort:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-bold uppercase tracking-wider text-[9px]">
                    <TrendingUp className="h-3.5 w-3.5" /> {hasSensors ? "Active Monitoring" : "Standby"}
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
