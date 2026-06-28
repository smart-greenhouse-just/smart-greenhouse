"use client";

import { Cpu, Server, Database, Heart, Mail, Sprout, ArrowRight, Shield } from "lucide-react";

export default function About() {
  const hardware = [
    { name: "ESP32-WROOM-32D", category: "Core MCU", desc: "Dual-core processor with onboard Wi-Fi and Bluetooth." },
    { name: "OV2640 Camera", category: "Vision Module", desc: "2-Megapixel image sensor for leaf pathology captures." },
    { name: "DHT22 / AM2302", category: "Climate Sensor", desc: "Capacitive humidity and high-accuracy thermal metrics." },
    { name: "Capacitive Soil v1.2", category: "Hydration Sensor", desc: "Corrosion-resistant soil moisture frequency reader." },
    { name: "MQ-135 sensor", category: "Air Quality", desc: "Detects ammonia, carbon dioxide, benzene, and smoke." },
    { name: "Ultrasonic HC-SR04", category: "Reservoir level", desc: "Measures water tank depletion thresholds." },
  ];

  const techStack = [
    { name: "Next.js 16 (App Router)", desc: "React Framework for fast, optimized production server environments.", icon: Sprout },
    { name: "Tailwind CSS v4", desc: "Modern styling framework incorporating CSS variable-based design systems.", icon: Shield },
    { name: "Mongoose & MongoDB", desc: "Flexible document-based storage schemas for telemetry logging.", icon: Database },
    { name: "MQTT Broker Integration", desc: "Sub-second asynchronous messaging architecture for hardware events.", icon: Server },
    { name: "Socket.IO / WebSockets", desc: "Bi-directional real-time communication pathways connecting ESP32 nodes.", icon: Cpu },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-16">
      <div>
        <h1 className="font-sans text-xl font-extrabold text-foreground tracking-tight">About Smart Greenhouse Project</h1>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          IoT Hardware Specs, Architecture, and Mission Roadmap
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <Heart className="h-4.5 w-4.5 text-red-500" /> Project Mission
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Smart Greenhouse is an open-source, smart greenhouse monitoring and automation platform. Our goal is to bridge the gap between low-cost IoT hardware and premium SaaS user experiences. By utilizing the ultra-cheap ESP32 MCU and combining it with modern web standards, we provide small-scale horticulturists with tools typically locked behind expensive industrial equipment.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Through real-time telemetry streaming, automated climate loops, and future edge computer-vision plant health analysis, Smart Greenhouse makes precision agriculture accessible.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Project Summary</h3>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">License:</span>
                <span className="text-foreground">MIT License</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">Version:</span>
                <span className="text-foreground font-mono text-[10px]">1.2.4-stable</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Repository:</span>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  GitHub Repo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-8">System Architecture Flow</h3>
        
        <div className="grid gap-6 md:grid-cols-3 relative text-center">
          <div className="hidden md:flex absolute top-10 left-1/3 w-8 items-center justify-center text-primary pointer-events-none">
            <ArrowRight className="h-5 w-5" />
          </div>
          <div className="hidden md:flex absolute top-10 left-2/3 w-8 items-center justify-center text-primary pointer-events-none">
            <ArrowRight className="h-5 w-5" />
          </div>

          <div className="flex flex-col items-center p-4 bg-muted/40 rounded-2xl border border-border/50">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent text-primary mb-3">
              <Cpu className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-foreground mb-1">1. IoT ESP32 Nodes</h4>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Dispatches capacitive soil humidity, light photodiode, and DHT22 telemetry registers.
            </p>
          </div>

          <div className="flex flex-col items-center p-4 bg-muted/40 rounded-2xl border border-border/50">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent text-primary mb-3">
              <Server className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-foreground mb-1">2. Core MQTT Broker</h4>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Funnels asynchronous command and status topics across active subscribers.
            </p>
          </div>

          <div className="flex flex-col items-center p-4 bg-muted/40 rounded-2xl border border-border/50">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent text-primary mb-3">
              <Database className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-foreground mb-1">3. Next.js & MongoDB</h4>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Executes backend services, logs telemetry logs, and aggregates crop health indicators.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Web Technology Stack</h3>
          <div className="space-y-3">
            {techStack.map((tech, idx) => {
              const Icon = tech.icon;
              return (
                <div key={idx} className="flex gap-4 rounded-xl border border-border bg-card p-4 items-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground mb-0.5">{tech.name}</h4>
                    <p className="text-[10px] text-muted-foreground leading-normal font-medium">{tech.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Supported Hardware Instrumentation</h3>
          <div className="grid gap-3 grid-cols-2">
            {hardware.map((hard, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-card p-3.5 flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-accent text-primary text-[8px] font-bold uppercase px-1.5 py-0.5 mb-2">
                    {hard.category}
                  </span>
                  <h4 className="text-xs font-bold text-foreground leading-tight mb-1">{hard.name}</h4>
                  <p className="text-[9.5px] text-muted-foreground font-medium leading-normal">{hard.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
        <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Platform Roadmap</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-primary">Q3 2026</span>
            <h4 className="text-xs font-extrabold text-foreground">Solar Battery Node Metrics</h4>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Integrate solar battery voltage monitors and solar intensity indicators to measure green power reserves.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-primary">Q4 2026</span>
            <h4 className="text-xs font-extrabold text-foreground">CNN Crop Vision Classifier</h4>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Deploy TensorFlow Lite convolution neural nets directly on ESP32-CAM nodes for edge blight checks.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-primary">Q1 2027</span>
            <h4 className="text-xs font-extrabold text-foreground">Multi-Zone Microclimates</h4>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Support mesh networks (ESP-NOW) connecting multiple localized nodes from a single gateway.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Development Team</h3>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">SA</div>
            <div>
              <p className="text-foreground">Sahed Ahmed</p>
              <p className="text-[10px] text-muted-foreground">Lead Architect / Embedded engineer</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between gap-4">
          <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Contact & Support</h3>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Mail className="h-4.5 w-4.5 text-primary" />
            <span>support@greenhouse.io</span>
          </div>
        </div>
      </div>
    </div>
  );
}
