"use client";

import { useState, useEffect } from "react";
import { useRealtimeData } from "./useRealtimeData";
import { RealtimeState } from "@/services/realtime";

export interface AlertItem {
  id: string;
  severity: "info" | "warning" | "critical";
  sensor: string;
  message: string;
  suggestedAction: string;
  timestamp: Date;
  dismissed: boolean;
}

export interface ActivityLog {
  id: string;
  event: string;
  type: "system" | "actuator" | "camera" | "alert";
  timestamp: Date;
}

export function useGreenhouse() {
  const {
    data,
    setActuator,
    capturedImage: wsCapturedImage,
    setCapturedImage: setWsCapturedImage,
    triggerCapture,
    triggerStartStream,
    triggerStopStream,
    streamFrame,
  } = useRealtimeData();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const capturedImage = wsCapturedImage;
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogs([
        { id: "1", event: "ESP32 Controller Connected", type: "system", timestamp: new Date(Date.now() - 500000) },
        { id: "2", event: "MQTT Broker Connected", type: "system", timestamp: new Date(Date.now() - 480000) },
        { id: "3", event: "Database Connection Established", type: "system", timestamp: new Date(Date.now() - 460000) },
      ]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!data) return;
    const sensors = data.sensors;
    const newAlerts: AlertItem[] = [];

    if (sensors.soilMoisture < 25) {
      newAlerts.push({
        id: "soil-low",
        severity: "critical",
        sensor: "Soil Moisture",
        message: `Critical dry state: Soil moisture is at ${sensors.soilMoisture}%`,
        suggestedAction: "Trigger the Water Pump manually or adjust automated cycles.",
        timestamp: new Date(),
        dismissed: false,
      });
    }

    if (sensors.temperature > 32) {
      newAlerts.push({
        id: "temp-high",
        severity: "warning",
        sensor: "Temperature",
        message: `High thermal threshold: Temperature is ${sensors.temperature}°C`,
        suggestedAction: "Turn on the cooling fan or open secondary exhaust vents.",
        timestamp: new Date(),
        dismissed: false,
      });
    }

    if (data.espStatus === "offline") {
      newAlerts.push({
        id: "esp-offline",
        severity: "critical",
        sensor: "ESP32 Connection",
        message: "ESP32 Controller Offline. Telemetry stream disrupted.",
        suggestedAction: "Check device power source and verify local WiFi credentials.",
        timestamp: new Date(),
        dismissed: false,
      });
    }

    if (data.cameraStatus === "offline") {
      newAlerts.push({
        id: "camera-offline",
        severity: "critical",
        sensor: "ESP32 Camera",
        message: "ESP32 Camera Module Offline. Video stream unavailable.",
        suggestedAction: "Check camera power supply and verify local network parameters.",
        timestamp: new Date(),
        dismissed: false,
      });
    }

    const timer = setTimeout(() => {
      setAlerts((prev) => {
        const resolvedIds = ["soil-low", "temp-high", "esp-offline", "camera-offline"].filter(
          (id) => !newAlerts.some((a) => a.id === id)
        );

        let updated = prev.filter((p) => !resolvedIds.includes(p.id));

        newAlerts.forEach((a) => {
          const existing = updated.find((u) => u.id === a.id);
          if (!existing) {
            updated = [a, ...updated];
            
            setLogs((l) => [
              {
                id: Math.random().toString(),
                event: `Alert: ${a.message}`,
                type: "alert",
                timestamp: new Date(),
              },
              ...l,
            ]);
          }
        });

        return updated;
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [data]);

  const dismissAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    );
  };

  const handleToggleActuator = (key: keyof RealtimeState["actuators"]) => {
    if (!data) return;
    const nextVal = !data.actuators[key];
    setActuator(key, nextVal);
    
    const names = {
      pump: "Water Pump",
      growLight: "Grow Light",
      fan: "Cooling Fan",
      ventilation: "Ventilation Shutter",
    };
    
    setLogs((prev) => [
      {
        id: Math.random().toString(),
        event: `${names[key]} turned ${nextVal ? "ON" : "OFF"}`,
        type: "actuator",
        timestamp: new Date(),
      },
      ...prev,
    ]);
  };

  const handleStartStream = async () => {
    if (!data) return;
    setStreamActive(true);
    triggerStartStream();
    setLogs((prev) => [
      { id: Math.random().toString(), event: "Camera Stream Started", type: "camera", timestamp: new Date() },
      ...prev,
    ]);
  };

  const handleStopStream = async () => {
    if (!data) return;
    setStreamActive(false);
    triggerStopStream();
    setLogs((prev) => [
      { id: Math.random().toString(), event: "Camera Stream Stopped", type: "camera", timestamp: new Date() },
      ...prev,
    ]);
  };

  const handleCaptureImage = async () => {
    setIsCapturing(true);

    if (streamActive && streamFrame) {
      setWsCapturedImage({
        id: Math.random().toString(36).substring(7),
        imageUrl: streamFrame,
        timestamp: new Date(),
      });
      setIsCapturing(false);
      setLogs((prev) => [
        { id: Math.random().toString(), event: "Camera Snapshot Captured (Live Stream)", type: "camera", timestamp: new Date() },
        ...prev,
      ]);
      return;
    }

    triggerCapture();
    setTimeout(() => {
      setIsCapturing(false);
      setLogs((prev) => [
        { id: Math.random().toString(), event: "Camera Snapshot Captured", type: "camera", timestamp: new Date() },
        ...prev,
      ]);
    }, 900);
  };

  const handleAnalyzeImage = async () => {
    if (!capturedImage) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/camera/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: capturedImage.id }),
      });
      if (!res.ok) {
        throw new Error("Failed to analyze image from camera API");
      }
      const analysis = await res.json();
      setWsCapturedImage((prev) => (prev ? { ...prev, analysis } : null));
      setLogs((prev) => [
        { id: Math.random().toString(), event: `Leaf Analysis Completed: Plant is ${analysis.status.toUpperCase()}`, type: "camera", timestamp: new Date() },
        ...prev,
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteImage = () => {
    setWsCapturedImage(null);
    setLogs((prev) => [
      { id: Math.random().toString(), event: "Snapshot deleted from local buffer", type: "camera", timestamp: new Date() },
      ...prev,
    ]);
  };

  return {
    state: data,
    alerts: alerts.filter((a) => !a.dismissed),
    logs,
    capturedImage,
    isCapturing,
    isAnalyzing,
    streamActive,
    streamFrame,
    toggleActuator: handleToggleActuator,
    dismissAlert,
    startStream: handleStartStream,
    stopStream: handleStopStream,
    captureImage: handleCaptureImage,
    analyzeImage: handleAnalyzeImage,
    deleteImage: handleDeleteImage,
  };
}
