"use client";

import { useEffect, useRef, useState } from "react";
import { RealtimeState } from "@/services/realtime";
import { CapturedImageDetails } from "@/services/camera";

export function useRealtimeData() {
  const [data, setData] = useState<RealtimeState | null>(null);
  const [capturedImage, setCapturedImage] = useState<CapturedImageDetails | null>(null);
  const [streamFrame, setStreamFrame] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isMounted = true;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const port = process.env.NEXT_PUBLIC_WS_PORT || "3001";
    const wsUrl = `${protocol}//${window.location.hostname}:${port}`;

    const connect = () => {
      if (!isMounted) return;
      console.log(`[WebSocket Client] Connecting to: ${wsUrl}`);
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("[WebSocket Client] Connected to greenhouse server");
        setData((prev) => {
          if (prev) {
            return {
              ...prev,
              espStatus: "offline",
              cameraStatus: "offline",
              mqttStatus: "connected",
              dbStatus: "connected",
            };
          }
          return {
            espStatus: "offline",
            cameraStatus: "offline",
            wifiStrength: -100,
            mqttStatus: "connected",
            dbStatus: "connected",
            sensors: {
              temperature: 24.0,
              humidity: 60.0,
              soilMoisture: 40,
              lightIntensity: 300,
              timestamp: new Date(),
            },
            actuators: {
              pump: false,
              growLight: false,
              fan: false,
            },
          };
        });
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "realtime") {
            setData(parsed);
          } else if (parsed.type === "status") {
            setData((prev) => (prev ? { ...prev, ...parsed } : null));
          } else if (parsed.type === "camera_frame") {
            setStreamFrame(parsed.image);
          } else if (parsed.type === "capture_result") {
            setCapturedImage(parsed.image);
          }
        } catch (e) {
          console.error("[WebSocket Client] Error parsing incoming socket message:", e);
        }
      };

      socket.onerror = (err) => {
        console.error("[WebSocket Client] Connection error:", err);
      };

      socket.onclose = () => {
        console.log("[WebSocket Client] Connection closed. Retrying in 3 seconds...");
        setData((prev) => {
          if (prev) {
            return {
              ...prev,
              espStatus: "offline",
              mqttStatus: "disconnected",
              wifiStrength: -100,
            };
          }
          return null;
        });

        if (isMounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    };

    fetch("/api/sensors/history?timeframe=24h")
      .then(() => {
        console.log("[WebSocket Client] Server daemon bootstrapped successfully");
        if (isMounted) connect();
      })
      .catch((err) => {
        console.error("[WebSocket Client] Bootstrap failed, connecting anyway:", err);
        if (isMounted) connect();
      });

    return () => {
      isMounted = false;
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const setActuator = async (key: keyof RealtimeState["actuators"], value: boolean) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: "control",
        actuator: key,
        value,
      });
      ws.send(payload);
      console.log("[WebSocket Client] Dispatched actuator override command:", payload);

      setData((prev) => {
        if (prev) {
          return {
            ...prev,
            actuators: {
              ...prev.actuators,
              [key]: value,
            },
          };
        }
        return null;
      });
    } else {
      console.warn("[WebSocket Client] Socket not open. Toggling actuator failed.");
    }
  };

  const triggerCapture = () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: "capture",
      });
      ws.send(payload);
      console.log("[WebSocket Client] Dispatched image capture trigger command:", payload);
    } else {
      console.warn("[WebSocket Client] Socket not open. Capturing image failed.");
    }
  };

  const triggerStartStream = () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: "control",
        action: "start_stream",
      });
      ws.send(payload);
      console.log("[WebSocket Client] Dispatched start stream command:", payload);
    } else {
      console.warn("[WebSocket Client] Socket not open. Starting stream failed.");
    }
  };

  const triggerStopStream = () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: "control",
        action: "stop_stream",
      });
      ws.send(payload);
      console.log("[WebSocket Client] Dispatched stop stream command:", payload);
    } else {
      console.warn("[WebSocket Client] Socket not open. Stopping stream failed.");
    }
  };

  return {
    data,
    capturedImage,
    setCapturedImage,
    streamFrame,
    setStreamFrame,
    setActuator,
    triggerCapture,
    triggerStartStream,
    triggerStopStream,
  };
}
