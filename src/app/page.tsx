"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sprout,
  Activity,
  Cpu,
  Database,
  Wifi,
  Thermometer,
  Droplets,
  Sun,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Camera,
  ChevronsRight,
} from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  } as const;

  const featureCards = [
    {
      title: "Real-Time Monitoring",
      description: "Monitor all greenhouse telemetry sensors instantly with sub-second latencies.",
      icon: Activity,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Automation Controllers",
      description: "Control pumps, full-spectrum lights, and cooling fans remotely based on plant states.",
      icon: Cpu,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "ESP32 Eye Camera",
      description: "Live camera stream captures with instant local downloads and built-in AI analysis.",
      icon: Camera,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Crop Analytics",
      description: "Interactive historical telemetry overviews, average logs, and correlation analytics.",
      icon: Sprout,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
    },
    {
      title: "Priority Warnings",
      description: "Receive instant notifications and diagnostic instructions when thresholds are exceeded.",
      icon: ShieldAlert,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Global Remote Access",
      description: "Secure SaaS MQTT-ready connection pathways let you manage your greenhouse anywhere.",
      icon: Wifi,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
  ];

  const sensors = [
    { name: "Temperature", icon: Thermometer, desc: "Monitor thermal values", color: "text-red-500", bg: "bg-red-500/10" },
    { name: "Humidity", icon: Droplets, desc: "Monitor air moisture levels", color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Soil Moisture", icon: Sprout, desc: "Monitor root hydration status", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Light Intensity", icon: Sun, desc: "Monitor PAR solar lux exposure", color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Water Level", icon: Droplets, desc: "Monitor tank water capacity", color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { name: "Air Quality", icon: Activity, desc: "Monitor CO2/AQI ppm indexes", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-20 py-4 md:py-6">
      <section className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="space-y-6 lg:col-span-7">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Next-Gen IoT Greenhouse Automation
          </div>
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6.5xl leading-tight">
            Smart Greenhouse <span className="text-primary font-bold">IoT</span> Dashboard
          </h1>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-lg">
            A premium dashboard offering sub-second telemetry sensor streaming, smart hardware actuator switches, and computer-vision leaf disease diagnostic logs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground hover:brightness-105 shadow-md shadow-emerald-500/15 transition-all hover:scale-102 cursor-pointer"
            >
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="relative lg:col-span-5 flex items-center justify-center">
          <div className="relative aspect-square w-full max-w-xs md:max-w-sm rounded-3xl overflow-hidden border border-border glass p-3">
            <div className="relative h-full w-full rounded-2xl overflow-hidden bg-slate-900 border border-border/55">
              <Image
                src="/hero-greenhouse.png"
                alt="Smart greenhouse overview"
                fill
                className="object-cover opacity-85 hover:scale-103 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/70 font-semibold">Node Status</span>
                  <span className="text-[11px] font-bold text-emerald-400">ESP32: Online</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-sans text-2xl font-extrabold text-foreground md:text-3xl">Platform Features</h2>
          <p className="text-xs font-semibold text-muted-foreground max-w-md mx-auto">
            Everything you need to monitor, control, and analyze microclimates from a unified SaaS dashboard.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featureCards.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${feat.bgColor} ${feat.color} mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-sans text-sm font-bold text-foreground mb-1.5">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">{feat.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section className="rounded-3xl border border-border bg-muted/30 p-8 md:p-10">
        <div className="text-center space-y-2 mb-10">
          <h2 className="font-sans text-2xl font-extrabold text-foreground md:text-3xl">How It Works</h2>
          <p className="text-xs font-semibold text-muted-foreground">
            End-to-end data pipeline facilitating real-time telemetry updates.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8 max-w-4xl mx-auto">
          {[
            { label: "ESP32 Node", desc: "Sensors & Actuators", icon: Cpu },
            { label: "MQTT Broker", desc: "SaaS Message Relay", icon: Wifi },
            { label: "NextJS Server", desc: "API Endpoint Processing", icon: Activity },
            { label: "MongoDB", desc: "Historical Analytics Store", icon: Database },
            { label: "Smart Greenhouse Web", desc: "Glassmorphic UX Monitor", icon: Sprout },
          ].map((step, idx, arr) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="flex flex-col items-center text-center bg-card border border-border rounded-2xl p-4.5 w-44 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary mb-2">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground mb-0.5">{step.label}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-snug">{step.desc}</p>
                </div>
                {idx < arr.length - 1 && (
                  <div className="flex items-center justify-center text-muted-foreground rotate-90 md:rotate-0">
                    <ChevronsRight className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-sans text-2xl font-extrabold text-foreground md:text-3xl">Supported Hardware Sensors</h2>
          <p className="text-xs font-semibold text-muted-foreground">
            Plug-and-play compatibility with standard microelectronic instrumentation.
          </p>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
          {sensors.map((sensor, idx) => {
            const Icon = sensor.icon;
            return (
              <div
                key={idx}
                className="group flex flex-col items-center text-center rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/20 hover:shadow-sm"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${sensor.bg} ${sensor.color} mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-[11px] font-bold text-foreground mb-0.5 leading-snug">{sensor.name}</h4>
                <span className="text-[9px] text-muted-foreground leading-normal font-semibold">{sensor.desc}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 p-8 md:p-12 text-white shadow-lg shadow-emerald-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="font-sans text-2xl font-extrabold md:text-3xl leading-tight">Start Monitoring Your Greenhouse</h2>
            <p className="text-xs font-semibold text-white/80 max-w-md leading-relaxed">
              Experience the complete real-time IoT cockpit telemetry. Toggle water lines, lights, and verify environmental thresholds today.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-emerald-600 hover:bg-slate-50 transition-colors shadow-md cursor-pointer shrink-0"
          >
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
