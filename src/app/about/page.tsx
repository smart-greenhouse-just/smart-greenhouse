"use client";

import {
  Cpu,
  Server,
  Database,
  Heart,
  Sprout,
  Shield,
  Sun,
  Droplets,
  Thermometer,
  Fan,
  Lightbulb,
  Radio,
  Clock,
  CheckCircle2,
  Tv,
  Camera,
  Activity,
  Code2,
} from "lucide-react";

export default function About() {
  const hardware = [
    {
      name: "ESP32-WROOM-32D",
      category: "Edge MCU",
      icon: Cpu,
      specs: "240MHz Dual-Core, 520KB SRAM, 2.4GHz 802.11 b/g/n Wi-Fi",
      desc: "Executes non-blocking sensor acquisition loops, active-LOW relay sequencing, and WebSocket daemon streaming.",
    },
    {
      name: "DHT11 / DHT22 Sensor",
      category: "Climate Sensor",
      icon: Thermometer,
      specs: "GPIO 4 • 0-100% RH • -40°C to 80°C",
      desc: "Captures ambient ambient air temperature and relative humidity with Vapor Pressure Deficit (VPD) evaluation.",
    },
    {
      name: "Capacitive Soil Probe v1.2",
      category: "Hydration Sensor",
      icon: Droplets,
      specs: "Analog Pin 35 • 12-bit ADC (1500 - 3500 counts)",
      desc: "Corrosion-resistant capacitive moisture sensing mapped to 0-100% hydration for automatic irrigation.",
    },
    {
      name: "LDR Photoresistor Module",
      category: "Illumination Sensor",
      icon: Sun,
      specs: "Analog Pin 32 • 12-bit ADC (0 - 4095 counts)",
      desc: "Measures ambient lux levels; dynamically mapped to 0-100% daylight intensity with 3400 dark threshold.",
    },
    {
      name: "3-Channel 5V Optocoupled Relay",
      category: "Actuator Controller",
      icon: Radio,
      specs: "Pins 23 (Pump), 27 (Fan), 25 (Grow Light) • Active LOW",
      desc: "Galvanically isolated switches commanding 12V water pump, cooling fan, and full-spectrum LED grow light.",
    },
    {
      name: "16x2 I2C Character LCD",
      category: "Local Display",
      icon: Tv,
      specs: "I2C Address 0x27 • SDA 21, SCL 22",
      desc: "Non-blocking screen carousel cycling Temp/Hum, Soil/Pump/Fan status, and Light/Sun levels every 2s.",
    },
    {
      name: "OV2640 ESP32-CAM",
      category: "Vision Module",
      icon: Camera,
      specs: "2-Megapixel Sensor • Wi-Fi Stream",
      desc: "Secondary edge vision module capturing live camera frames and leaf snapshots for AI pathology diagnostics.",
    },
  ];

  const automationRules = [
    {
      actuator: "Water Irrigation Pump",
      pin: "GPIO 23",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      sensor: "Capacitive Soil Moisture",
      condition: "Moisture < 30%",
      action: "Turn ON Pump (Low: active)",
      offCondition: "Moisture > 45%",
      overrideDuration: "60 seconds (Auto-reset when soil > 50%)",
    },
    {
      actuator: "Exhaust Cooling Fan",
      pin: "GPIO 27",
      icon: Fan,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      sensor: "DHT Air Temperature",
      condition: "Temperature > 27.0 °C",
      action: "Turn ON Cooling Fan",
      offCondition: "Temperature ≤ 27.0 °C",
      overrideDuration: "30 seconds (Auto-reset on emergency heat > 32°C)",
    },
    {
      actuator: "Grow Light Array",
      pin: "GPIO 25",
      icon: Lightbulb,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      sensor: "LDR Photoresistor",
      condition: "LDR ADC ≥ 3400 (Dark)",
      action: "Turn ON Grow Light",
      offCondition: "LDR ADC < 3400 (Daylight)",
      overrideDuration: "30 seconds (Auto-reset after safety window)",
    },
  ];

  const techStack = [
    {
      name: "Next.js 16 (App Router)",
      desc: "React 19 Server & Client Components, Route Handlers, and high-speed streaming dashboard architecture.",
      icon: Sprout,
    },
    {
      name: "Native WebSocket Daemon",
      desc: "Bi-directional WebSocket server on port 3001 broadcasting sub-second telemetry and instant actuator controls.",
      icon: Server,
    },
    {
      name: "Mongoose & MongoDB",
      desc: "Document database with structured multi-sensor schema, historical time-series logging, and aggregate analytics.",
      icon: Database,
    },
    {
      name: "Tailwind CSS & Design Tokens",
      desc: "Custom CSS variable-based design system featuring dark mode glassmorphism, responsive grids, and clean cards.",
      icon: Shield,
    },
    {
      name: "Recharts Visualization",
      desc: "Interactive area charts, bar breakdowns, psychrometric dispersion scatter plots, and telemetry chronologies.",
      icon: Activity,
    },
    {
      name: "Arduino C++ Firmware",
      desc: "Non-blocking FreeRTOS-compatible sketch with ArduinoJson 6 multi-sensor nested serialization and auto-reconnect.",
      icon: Code2,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-8">
      {/* Header */}
      <div>
        <h1 className="font-sans text-xl font-extrabold text-foreground tracking-tight">About Smart Greenhouse System</h1>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          System Architecture, IoT Hardware Instrumentation, and Automation Specifications
        </p>
      </div>

      {/* Project Mission & Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Heart className="h-4.5 w-4.5 text-emerald-500" /> Platform Overview
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              The Smart Greenhouse system is a full-stack IoT precision agriculture and microclimate management platform. It bridges low-cost embedded hardware (ESP32) with a modern web architecture, delivering real-time telemetry streaming, automated environmental closed loops, and remote actuator overrides.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Every 5 seconds, the ESP32 node samples soil moisture, ambient humidity, temperature, and illumination, dispatching structured multi-sensor payloads to the WebSocket daemon for immediate frontend broadcast and persistent MongoDB time-series archiving.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Node & System Specs</h3>
            <div className="space-y-2 text-xs font-medium">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">Node ID:</span>
                <span className="text-foreground font-mono font-bold text-[11px]">esp32-greenhouse-01</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">Telemetry Interval:</span>
                <span className="text-emerald-500 font-bold font-mono text-[11px]">5.0 seconds</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">Protocol:</span>
                <span className="text-foreground font-semibold">WebSockets (Port 3001)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database:</span>
                <span className="text-foreground font-semibold">MongoDB Atlas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Tier Architecture */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
        <div>
          <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">4-Tier System Architecture</h3>
          <p className="text-[10px] text-muted-foreground font-semibold">End-to-End Data Pipeline and Control Loop</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col p-4 bg-muted/20 rounded-2xl border border-border/60 justify-between">
            <div>
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <Cpu className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-foreground mb-1">1. Edge Microcontroller</h4>
              <p className="text-[10.5px] text-muted-foreground font-medium leading-relaxed">
                ESP32 reads analog soil & LDR voltages via 12-bit ADC and captures digital DHT readings. Executes non-blocking local automation.
              </p>
            </div>
            <span className="mt-3 text-[9px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded w-fit">
              ESP32 C++ Sketch
            </span>
          </div>

          <div className="flex flex-col p-4 bg-muted/20 rounded-2xl border border-border/60 justify-between">
            <div>
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-3">
                <Server className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-foreground mb-1">2. WebSocket Daemon</h4>
              <p className="text-[10.5px] text-muted-foreground font-medium leading-relaxed">
                Persistent server on port 3001 normalizes multi-sensor JSON, verifies device state, and broadcasts updates with &lt;15ms latency.
              </p>
            </div>
            <span className="mt-3 text-[9px] font-mono font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded w-fit">
              ws://:3001 Daemon
            </span>
          </div>

          <div className="flex flex-col p-4 bg-muted/20 rounded-2xl border border-border/60 justify-between">
            <div>
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-3">
                <Database className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-foreground mb-1">3. Time-Series Storage</h4>
              <p className="text-[10.5px] text-muted-foreground font-medium leading-relaxed">
                MongoDB SensorLog collection stores structured readings, individual sensor sub-arrays, raw ADC values, and historical snapshots.
              </p>
            </div>
            <span className="mt-3 text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded w-fit">
              Mongoose Schemas
            </span>
          </div>

          <div className="flex flex-col p-4 bg-muted/20 rounded-2xl border border-border/60 justify-between">
            <div>
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-3">
                <Tv className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-xs font-bold text-foreground mb-1">4. Cockpit & Analytics</h4>
              <p className="text-[10.5px] text-muted-foreground font-medium leading-relaxed">
                Next.js web interface renders live sensor telemetry, Vapor Pressure Deficit, interactive chronology charts, and manual control overrides.
              </p>
            </div>
            <span className="mt-3 text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
              Next.js Dashboard
            </span>
          </div>
        </div>
      </div>

      {/* Closed-Loop Automation Rules */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
        <div>
          <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Automated Closed-Loop Control Rules</h3>
          <p className="text-[10px] text-muted-foreground font-semibold">Thresholds and Hardware Actuator Safety Timers</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {automationRules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div key={idx} className="rounded-2xl border border-border/70 bg-muted/10 p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{rule.actuator}</span>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${rule.bg} ${rule.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-muted-foreground">Relay Pin:</span>
                      <span className="font-bold text-foreground">{rule.pin}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-muted-foreground">Trigger ON:</span>
                      <span className="font-bold text-amber-500">{rule.condition}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-muted-foreground">Trigger OFF:</span>
                      <span className="font-bold text-emerald-500">{rule.offCondition}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-2.5 space-y-1 text-[9px]">
                  <div className="flex items-center gap-1 text-muted-foreground font-medium">
                    <Clock className="h-3 w-3 shrink-0 text-primary" />
                    <span>Override Timeout: {rule.overrideDuration}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hardware Instrumentation Specs */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Physical Hardware Instrumentation</h3>
          <p className="text-[10px] text-muted-foreground font-semibold">Active Sensors, Transducers, and Isolated Switching Modules</p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {hardware.map((hard, idx) => {
            const Icon = hard.icon;
            return (
              <div key={idx} className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex rounded-md bg-accent text-primary text-[9px] font-bold uppercase px-2 py-0.5">
                      {hard.category}
                    </span>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground leading-tight mb-1">{hard.name}</h4>
                  <p className="text-[10px] font-mono text-primary font-medium mb-1.5">{hard.specs}</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">{hard.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Software & Framework Stack</h3>
          <p className="text-[10px] text-muted-foreground font-semibold">Modern Full-Stack Web Technologies & Firmware Libraries</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {techStack.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <div key={idx} className="flex gap-3.5 rounded-2xl border border-border bg-card p-4 items-start shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground mb-0.5">{tech.name}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{tech.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Architectural Guarantees */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-sm">
        <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Architectural Guarantees & Safeguards</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <span><strong>No Synthetic Fallbacks:</strong> All charts, tables, and Cockpit cards strictly render real physical telemetry logs with zero placeholder data.</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <span><strong>Multi-Sensor Schema:</strong> Normalized Mongoose documents allow dynamically adding secondary or tertiary probes without breaking schema contracts.</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <span><strong>Fail-Safe Overrides:</strong> Web dashboard manual overrides automatically revert to closed-loop thresholds after safety windows expire (30s / 60s).</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <span><strong>Non-Blocking FreeRTOS Loops:</strong> The ESP32 sketch avoids blocking delays, guaranteeing uninterrupted WebSocket frame polling and instant command execution.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
