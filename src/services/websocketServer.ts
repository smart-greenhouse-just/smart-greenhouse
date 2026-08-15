import { WebSocketServer, WebSocket } from "ws";
import { dbConnect } from "./database";
import { SensorLog, getSensorAverage, normalizeSensorMetric, ISensorMetric } from "@/models/SensorLog";
import { Device } from "@/models/Device";
import { Command } from "@/models/Command";
import { CapturedImage } from "@/models/CapturedImage";

const WS_PORT = Number(process.env.WS_PORT || 3001);
const DEVICE_ID = process.env.NEXT_PUBLIC_DEVICE_ID || "esp32-greenhouse-01";

interface TelemetryData {
  temperature?: ISensorMetric | number | number[];
  humidity?: ISensorMetric | number | number[];
  soilMoisture?: ISensorMetric | number | number[];
  lightIntensity?: ISensorMetric | number | number[];
  wifiStrength?: number;
  pump?: boolean;
  growLight?: boolean;
  fan?: boolean;
}

interface WSMessage {
  type: string;
  deviceId?: string;
  data?: TelemetryData;
  actuator?: string;
  value?: boolean;
  image?: string | { id: string; imageUrl: string; timestamp: string | Date };
}

interface CustomWebSocket extends WebSocket {
  isEsp?: boolean;
  isCamera?: boolean;
}

interface GlobalWS {
  wss?: WebSocketServer;
  isStarting?: boolean;
}

const globalWS = global as unknown as GlobalWS;

export function broadcast(data: string, skipWs?: WebSocket) {
  const wss = globalWS.wss;
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== skipWs) {
      client.send(data);
    }
  });
}

export function initializeWebSocketServer() {
  if (globalWS.isStarting) return;

  if (globalWS.wss) {
    console.log("[WS] Closing existing WebSocket server to hot-reload new code...");
    try {
      globalWS.wss.close();
    } catch (e) {
      console.error("[WS] Error closing old server:", e);
    }
    globalWS.wss = undefined;
  }

  globalWS.isStarting = true;
  console.log(`[WS] Initializing WebSocket server on port ${WS_PORT}...`);

  try {
    const wss = new WebSocketServer({ port: WS_PORT });
    globalWS.wss = wss;

    wss.on("error", (err: unknown) => {
      const error = err as { code?: string };
      if (error.code === "EADDRINUSE") {
        console.log(`[WS] Port ${WS_PORT} already in use (EADDRINUSE). Skipping daemon setup.`);
      } else {
        console.error("[WS] WebSocket Server error:", err);
      }
    });

    wss.on("connection", (ws: WebSocket) => {
      console.log("[WS] Sockets connected");

      const isEspOnline = Array.from(wss.clients).some((c) => (c as CustomWebSocket).isEsp === true);
      const isCameraOnline = Array.from(wss.clients).some((c) => (c as CustomWebSocket).isCamera === true);

      ws.send(
        JSON.stringify({
          type: "status",
          espStatus: isEspOnline ? "online" : "offline",
          cameraStatus: isCameraOnline ? "online" : "offline",
          wifiStrength: isEspOnline ? -60 : -100,
          mqttStatus: "connected",
          dbStatus: "connected",
        })
      );

      ws.on("message", async (dataBuffer) => {
        try {
          const payload: WSMessage = JSON.parse(dataBuffer.toString());
          console.log("[WS] Message received:", payload);

          if (payload.type === "telemetry") {
            (ws as CustomWebSocket).isEsp = true;
            await dbConnect();
            const d = payload.data || {};

            const normTemp = normalizeSensorMetric(d.temperature, "°C", 24.1);
            const normHum = normalizeSensorMetric(d.humidity, "%", 65.1);
            const normSoil = normalizeSensorMetric(d.soilMoisture, "%", 45);
            const normLight = normalizeSensorMetric(d.lightIntensity, "ADC", 850);

            const log = new SensorLog({
              deviceId: payload.deviceId || DEVICE_ID,
              temperature: normTemp,
              humidity: normHum,
              soilMoisture: normSoil,
              lightIntensity: normLight,
              timestamp: new Date(),
            });
            await log.save();

            await Device.findOneAndUpdate(
              { deviceId: payload.deviceId || DEVICE_ID },
              {
                status: "online",
                wifiStrength: Number(d.wifiStrength ?? -60),
                lastSeen: new Date(),
              },
              { upsert: true }
            );

            const broadcastData = JSON.stringify({
              type: "realtime",
              espStatus: "online",
              wifiStrength: Number(d.wifiStrength ?? -60),
              mqttStatus: "connected",
              dbStatus: "connected",
              sensors: {
                temperature: getSensorAverage(normTemp),
                humidity: getSensorAverage(normHum),
                soilMoisture: getSensorAverage(normSoil),
                lightIntensity: getSensorAverage(normLight),
                timestamp: log.timestamp,
              },
              sensorDetails: {
                temperature: normTemp,
                humidity: normHum,
                soilMoisture: normSoil,
                lightIntensity: normLight,
              },
              actuators: {
                pump: Boolean(d.pump ?? false),
                growLight: Boolean(d.growLight ?? false),
                fan: Boolean(d.fan ?? false),
              },
            });

            broadcast(broadcastData, ws);
          } 
          else if (payload.type === "camera_telemetry") {
            (ws as CustomWebSocket).isCamera = true;
            console.log("[WS] ESP32 Camera node connected.");
            broadcast(JSON.stringify({
              type: "status",
              cameraStatus: "online",
            }));
          }
          else if (payload.type === "control") {
            await dbConnect();
            const cmd = new Command({
              deviceId: DEVICE_ID,
              command: `${payload.actuator}_${payload.value ? "on" : "off"}`,
              payload: JSON.stringify({ actuator: payload.actuator, value: payload.value }),
              status: "executed",
              timestamp: new Date(),
              executedAt: new Date(),
            });
            await cmd.save();

            broadcast(JSON.stringify(payload), ws);
          } 
          else if (payload.type === "capture") {
            const isCameraOnline = Array.from(wss.clients).some((c) => (c as CustomWebSocket).isCamera === true);
            if (isCameraOnline) {
              broadcast(JSON.stringify(payload), ws);
            } else {
              console.log("[WS] Capture request failed: ESP32 Camera node offline.");
              ws.send(JSON.stringify({
                type: "status",
                cameraStatus: "offline"
              }));
            }
          }
          else if (payload.type === "camera_frame") {
            broadcast(JSON.stringify(payload), ws);
          }
          else if (payload.type === "camera_capture") {
            console.log("[WS] Real camera frame captured. Writing to DB...");
            await dbConnect();
            const captured = new CapturedImage({
              deviceId: DEVICE_ID,
              imageUrl: payload.image,
              timestamp: new Date(),
            });
            await captured.save();

            const resultPayload = JSON.stringify({
              type: "capture_result",
              image: {
                id: captured._id.toString(),
                imageUrl: captured.imageUrl,
                timestamp: captured.timestamp,
              },
            });

            broadcast(resultPayload);
          }
        } catch (e) {
          console.error("[WS] Error handling client socket payload:", e);
        }
      });

      ws.on("close", () => {
        console.log("[WS] Connection closed");
        if ((ws as CustomWebSocket).isEsp) {
          const broadcastData = JSON.stringify({
            type: "status",
            espStatus: "offline",
            wifiStrength: -100,
            mqttStatus: "connected",
            dbStatus: "connected",
          });
          broadcast(broadcastData);
        }
        if ((ws as CustomWebSocket).isCamera) {
          const broadcastData = JSON.stringify({
            type: "status",
            cameraStatus: "offline",
          });
          broadcast(broadcastData);
        }
      });
    });

    console.log(`[WS] WebSocket server spawned on port ${WS_PORT} successfully.`);
    globalWS.isStarting = false;

  } catch (err) {
    console.error("[WS] Critical initialization error:", err);
    globalWS.isStarting = false;
  }
}

// Start immediately on imports
initializeWebSocketServer();
