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
  const rowsPerPage = 10;
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

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
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  const formatTime = (time: Date | string) => {
    const date = new Date(time);
    if (timeframe === "24h") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleExportCSV = () => {
    const headers = "Timestamp,Temperature(°C),Humidity(%),Soil Moisture(%),Light(%)\n";
    const rows = chartData
      .map(
        (log) =>
          `"${new Date(log.timestamp || Date.now()).toISOString()}",${log.temperature ?? ""},${log.humidity ?? ""},${log.soilMoisture ?? ""},${log.lightIntensity ?? ""}`
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

  const sortedLogs = [...chartData].sort((a, b) => {
    const timeA = new Date(a.timestamp || 0).getTime();
    const timeB = new Date(b.timestamp || 0).getTime();
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-xl font-extrabold text-foreground tracking-tight">System Analytics</h1>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Telemetry reports, diagnostics, and multi-sensor performance aggregations
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

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            <span className="text-[11px] font-semibold">Avg Temp</span>
          </div>
          <p className="text-lg font-extrabold text-foreground">
            {summary.avgTemperature > 0 ? `${summary.avgTemperature} °C` : "--"}
          </p>
          <span className="text-[9px] text-muted-foreground font-medium">Daily average climate</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-[11px] font-semibold">Avg Humidity</span>
          </div>
          <p className="text-lg font-extrabold text-foreground">
            {summary.avgHumidity > 0 ? `${summary.avgHumidity} %` : "--"}
          </p>
          <span className="text-[9px] text-muted-foreground font-medium">Daily average humidity</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Sprout className="h-4 w-4 text-emerald-500" />
            <span className="text-[11px] font-semibold">Avg Soil</span>
          </div>
          <p className="text-lg font-extrabold text-foreground">
            {summary.avgSoilMoisture > 0 ? `${summary.avgSoilMoisture} %` : "--"}
          </p>
          <span className="text-[9px] text-muted-foreground font-medium">Daily average hydration</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <span className="text-[11px] font-semibold">Avg Light</span>
            </div>
            <p className="text-lg font-extrabold text-foreground">
              {summary && summary.avgLightIntensity > 0
                ? `${Math.min(100, Math.max(0, Math.round(((3400 - summary.avgLightIntensity) / 3400) * 100)))} %`
                : "--"}
            </p>
          </div>
          <span className="text-[9px] text-muted-foreground font-mono mt-1">
            {summary && summary.avgLightIntensity > 0 ? `Raw: ${summary.avgLightIntensity} ADC` : "Daily Illumination"}
          </span>
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

        {chartData.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  stroke="currentColor"
                  className="text-[10px] font-mono text-muted-foreground"
                />
                <YAxis stroke="currentColor" className="text-[10px] font-mono text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  labelFormatter={(time) => new Date(time).toLocaleString()}
                />
                <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "600", paddingTop: "10px" }} />
                <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ef4444" strokeWidth={2} fill="url(#tempGradient)" />
                <Area type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#3b82f6" strokeWidth={2} fill="url(#humGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center rounded-xl bg-muted/10 border border-dashed border-border/60 text-center p-6">
            <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">No historical data recorded</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Start your ESP32 node to stream real telemetry.</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="border-b border-border/60 pb-3 mb-5">
            <h3 className="font-sans text-xs font-extrabold text-foreground uppercase tracking-wider">Hydration vs Illumination</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Soil Moisture & Light Correlation</p>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-24)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                  <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="currentColor" className="text-[10px] font-mono text-muted-foreground" />
                  <YAxis stroke="currentColor" className="text-[10px] font-mono text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    labelFormatter={(time) => new Date(time).toLocaleTimeString()}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "600" }} />
                  <Bar dataKey="soilMoisture" name="Soil (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lightIntensity" name="Light (ADC)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              Awaiting telemetry...
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="border-b border-border/60 pb-3 mb-5">
            <h3 className="font-sans text-xs font-extrabold text-foreground uppercase tracking-wider">Psychrometric Dispersion</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Vapor Pressure Distribution</p>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                  <XAxis type="number" dataKey="temperature" name="Temperature" unit="°C" stroke="currentColor" className="text-[10px] font-mono text-muted-foreground" />
                  <YAxis type="number" dataKey="humidity" name="Humidity" unit="%" stroke="currentColor" className="text-[10px] font-mono text-muted-foreground" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Scatter name="Readings" data={chartData} fill="#8b5cf6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
              Awaiting telemetry...
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="border-b border-border/60 pb-3 mb-5">
          <h3 className="font-sans text-xs font-extrabold text-foreground uppercase tracking-wider">System Operational Metrics</h3>
          <p className="text-[10px] text-muted-foreground font-semibold">Reliability and Node Latencies</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {performanceMetrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3.5 rounded-xl border border-border/60 bg-muted/10 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground">{item.title}</span>
                  <p className="text-base font-extrabold text-foreground">{item.value}</p>
                  <span className="text-[9px] text-muted-foreground">{item.desc}</span>
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
                <th
                  onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                  className="px-5 py-3 cursor-pointer select-none hover:text-foreground transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Timestamp</span>
                    <span className="text-[9px] text-primary font-bold">
                      {sortOrder === "desc" ? "↓ (Newest First)" : "↑ (Oldest First)"}
                    </span>
                  </div>
                </th>
                <th className="px-3 py-3">Temp (°C)</th>
                <th className="px-3 py-3">Humidity (%)</th>
                <th className="px-3 py-3">Soil Moisture (%)</th>
                <th className="px-3 py-3">Light (%)</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-muted-foreground">
                    No sensor records logged in database yet. Connect your ESP32 node to stream real telemetry.
                  </td>
                </tr>
              ) : (
                sortedLogs.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((log, index) => {
                  const isOptimal = (log.temperature ?? 0) <= 28 && (log.humidity ?? 0) <= 75 && (log.soilMoisture ?? 0) >= 25;
                  const rawLdr = log.lightIntensity;
                  const lightPct = rawLdr !== undefined
                    ? Math.min(100, Math.max(0, Math.round(((3400 - rawLdr) / 3400) * 100)))
                    : undefined;

                  return (
                    <tr key={index} className="hover:bg-muted/10 transition-colors font-medium">
                      <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap font-mono text-[10px]">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "--"}
                      </td>
                      <td className="px-3 py-3.5 text-foreground">{log.temperature ?? "--"}</td>
                      <td className="px-3 py-3.5 text-foreground">{log.humidity ?? "--"}</td>
                      <td className="px-3 py-3.5 text-foreground">{log.soilMoisture ?? "--"}</td>
                      <td className="px-3 py-3.5 text-foreground">
                        {lightPct !== undefined ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span>{lightPct}%</span>
                            <span className="text-[10px] text-muted-foreground font-mono">({rawLdr} ADC)</span>
                          </span>
                        ) : (
                          "--"
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          isOptimal ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {isOptimal ? "Optimal" : "Anomaly"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4 bg-muted/20">
          <span className="text-[10px] text-muted-foreground font-semibold">
            Showing {sortedLogs.length > 0 ? page * rowsPerPage + 1 : 0}-{Math.min(sortedLogs.length, (page + 1) * rowsPerPage)} of {sortedLogs.length} records
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-border px-3 py-1 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => ((p + 1) * rowsPerPage < sortedLogs.length ? p + 1 : p))}
              disabled={(page + 1) * rowsPerPage >= sortedLogs.length}
              className="rounded-lg border border-border px-3 py-1 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
