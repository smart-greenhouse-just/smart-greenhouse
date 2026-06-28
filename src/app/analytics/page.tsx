"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Sprout,
  Sun,
  Activity,
  Download,
  Calendar,
  Layers,
  Cpu,
  Clock,
  Camera,
} from "lucide-react";
import { sensorService, SensorData } from "@/services/sensor";
import { analyticsService, AnalyticsSummary, SystemPerformance, LeafHealthReport } from "@/services/analytics";

export default function Analytics() {
  const [hasMounted, setHasMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "90d">("24h");
  const [chartData, setChartData] = useState<SensorData[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [performance, setPerformance] = useState<SystemPerformance | null>(null);
  const [leafReport, setLeafReport] = useState<LeafHealthReport | null>(null);

  const [page, setPage] = useState(0);
  const rowsPerPage = 6;

  useEffect(() => {
    setTimeout(() => setHasMounted(true), 0);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const data = await sensorService.getHistory("esp32-greenhouse", timeframe);
      const summ = await analyticsService.getSummary("esp32-greenhouse");
      const perf = await analyticsService.getSystemPerformance("esp32-greenhouse");
      const leaf = await analyticsService.getLeafHealthReport("esp32-greenhouse");

      setChartData(data);
      setSummary(summ);
      setPerformance(perf);
      setLeafReport(leaf);
    }
    fetchData();
  }, [timeframe]);

  if (!hasMounted || !summary || !performance || !leafReport) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 py-6">
        <div className="h-6 w-32 animate-pulse rounded-lg bg-card" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  const formatTime = (time: Date) => {
    const date = new Date(time);
    if (timeframe === "24h") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleExportCSV = () => {
    const headers = "Timestamp,Temperature(°C),Humidity(%),Soil Moisture(%),Light(Lux)\n";
    const rows = chartData
      .map(
        (log) =>
          `"${new Date(log.timestamp).toISOString()}",${log.temperature},${log.humidity},${log.soilMoisture},${log.lightIntensity}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `greenhouse_analytics_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const performanceMetrics = [
    { title: "Device Uptime", value: `${performance.uptimePercentage}%`, desc: "ESP32 Controller Uptime", icon: Clock },
    { title: "Avg Latency", value: `${performance.mqttLatencyMs} ms`, desc: "MQTT Node Latency", icon: Activity },
    { title: "Response Time", value: `${performance.avgResponseTimeMs} ms`, desc: "API Transaction latency", icon: Cpu },
    { title: "Command Count", value: performance.commandsExecuted, desc: "Successfully dispatched", icon: Layers },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-xl font-extrabold text-foreground tracking-tight">System Analytics</h1>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Telemetry reports, diagnostics, and performance aggregations
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 self-start sm:self-auto">
          {(["24h", "7d", "30d", "90d"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setPage(0);
              }}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                timeframe === tf
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4.5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Thermometer className="h-4.5 w-4.5 text-red-500" />
            <span className="text-xs font-semibold">Avg Temperature</span>
          </div>
          <p className="text-xl font-extrabold text-foreground">{summary.avgTemperature} °C</p>
          <span className="text-[9px] text-muted-foreground font-medium">Daily average climate</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Droplets className="h-4.5 w-4.5 text-blue-500" />
            <span className="text-xs font-semibold">Avg Humidity</span>
          </div>
          <p className="text-xl font-extrabold text-foreground">{summary.avgHumidity} %</p>
          <span className="text-[9px] text-muted-foreground font-medium">Daily average humidity</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Sprout className="h-4.5 w-4.5 text-emerald-500" />
            <span className="text-xs font-semibold">Avg Soil Moisture</span>
          </div>
          <p className="text-xl font-extrabold text-foreground">{summary.avgSoilMoisture} %</p>
          <span className="text-[9px] text-muted-foreground font-medium">Daily average hydration</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4.5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Sun className="h-4.5 w-4.5 text-amber-500" />
            <span className="text-xs font-semibold">Avg Solar Light</span>
          </div>
          <p className="text-xl font-extrabold text-foreground">{summary.avgLightIntensity} Lux</p>
          <span className="text-[9px] text-muted-foreground font-medium">Daily average PAR exposure</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="border-b border-border/60 pb-3 mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-sans text-xs font-extrabold text-foreground uppercase tracking-wider">Climate Telemetry Trends</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Temperature & Humidity Comparison</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
            <Calendar className="h-3.5 w-3.5" /> Interactive Chronology
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="timestamp" tickFormatter={formatTime} className="text-[9px] font-semibold text-muted-foreground" />
              <YAxis className="text-[9px] font-semibold text-muted-foreground" />
              <Tooltip
                contentStyle={{ background: "rgba(11, 15, 25, 0.8)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "12px", backdropFilter: "blur(12px)", color: "#fff", fontSize: "11px" }}
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }} />
              <Area type="monotone" name="Temperature (°C)" dataKey="temperature" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
              <Area type="monotone" name="Humidity (%)" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHum)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="border-b border-border/60 pb-3 mb-4">
            <h3 className="font-sans text-xs font-extrabold text-foreground uppercase tracking-wider">Correlation Analysis</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Temperature vs Air Moisture Scatter</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis type="number" dataKey="temperature" name="Temp" unit="°C" className="text-[9px] font-semibold text-muted-foreground" />
                <YAxis type="number" dataKey="humidity" name="Hum" unit="%" className="text-[9px] font-semibold text-muted-foreground" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "rgba(11, 15, 25, 0.8)", fontSize: "11px", color: "#fff" }} />
                <Scatter name="Sensor Points" data={chartData} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="border-b border-border/60 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-sans text-xs font-extrabold text-foreground uppercase tracking-wider">AI Crop Health Diagnostics</h3>
              <p className="text-[10px] text-muted-foreground font-semibold">Healthy vs Diseased Leaf Captures</p>
            </div>
            <span className="text-[10px] font-bold text-primary flex items-center gap-1"><Camera className="h-3.5 w-3.5" /> Accuracy: {leafReport.accuracyRate}%</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leafReport.history} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="date" className="text-[9px] font-semibold text-muted-foreground" />
                <YAxis className="text-[9px] font-semibold text-muted-foreground" />
                <Tooltip contentStyle={{ background: "rgba(11, 15, 25, 0.8)", fontSize: "11px", color: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar name="Healthy Crops" dataKey="healthy" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Diseased Captures" dataKey="diseased" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="border-b border-border/60 pb-3 mb-5">
          <h3 className="font-sans text-xs font-extrabold text-foreground uppercase tracking-wider">Device Performance Logs</h3>
          <p className="text-[10px] text-muted-foreground font-semibold">Hardware operational diagnostics and MQTT latencies</p>
        </div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          {performanceMetrics.map((met, idx) => {
            const Icon = met.icon;
            return (
              <div key={idx} className="rounded-xl border border-border bg-muted/40 p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider">{met.title}</span>
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-foreground">{met.value}</p>
                  <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{met.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border bg-card px-5 py-4 gap-3">
          <div>
            <h3 className="font-sans text-xs font-extrabold text-foreground uppercase tracking-wider">Sensor Telemetry History Logs</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Raw hardware register outputs</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-4 py-3">Temp (°C)</th>
                <th className="px-4 py-3">Humidity (%)</th>
                <th className="px-4 py-3">Soil Moisture (%)</th>
                <th className="px-4 py-3">Light (Lux)</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {chartData.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((log, index) => {
                const isOptimal = log.temperature <= 28 && log.humidity <= 75 && log.soilMoisture >= 25;
                return (
                  <tr key={index} className="hover:bg-muted/10 transition-colors font-medium">
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-foreground">{log.temperature}</td>
                    <td className="px-4 py-3.5 text-foreground">{log.humidity}</td>
                    <td className="px-4 py-3.5 text-foreground">{log.soilMoisture}</td>
                    <td className="px-4 py-3.5 text-foreground">{log.lightIntensity}</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        isOptimal ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {isOptimal ? "Optimal" : "Anomaly"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4 bg-muted/20">
          <span className="text-[10px] text-muted-foreground font-semibold">
            Showing {page * rowsPerPage + 1}-{Math.min(chartData.length, (page + 1) * rowsPerPage)} of {chartData.length} records
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-border px-3 py-1 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => ((p + 1) * rowsPerPage < chartData.length ? p + 1 : p))}
              disabled={(page + 1) * rowsPerPage >= chartData.length}
              className="rounded-lg border border-border px-3 py-1 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
