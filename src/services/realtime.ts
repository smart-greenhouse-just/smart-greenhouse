import { SensorData } from "./sensor";

export interface RealtimeState {
  espStatus: "online" | "offline";
  cameraStatus: "online" | "offline";
  wifiStrength: number;
  mqttStatus: "connected" | "disconnected";
  dbStatus: "connected" | "disconnected";
  sensors: SensorData;
  actuators: {
    pump: boolean;
    growLight: boolean;
    fan: boolean;
  };
}

export type RealtimeListener = (state: RealtimeState) => void;

const listeners = new Set<RealtimeListener>();
let intervalId: NodeJS.Timeout | null = null;
let timeOffset = 0;

const state: RealtimeState = {
  espStatus: "online",
  cameraStatus: "online",
  wifiStrength: -62,
  mqttStatus: "connected",
  dbStatus: "connected",
  sensors: {
    temperature: 24.5,
    humidity: 62.1,
    soilMoisture: 42,
    lightIntensity: 420,
    timestamp: new Date(),
  },
  actuators: {
    pump: false,
    growLight: false,
    fan: false,
  },
};

function notify() {
  listeners.forEach((l) => l({ ...state }));
}

function tickSimulation() {
  const s = state.sensors;
  const a = state.actuators;

  if (a.pump) {
    s.soilMoisture = Math.min(100, s.soilMoisture + 1.5 + Math.random() * 0.5);
  } else {
    s.soilMoisture = Math.max(10, s.soilMoisture - 0.1 - Math.random() * 0.05);
  }

  if (a.fan) {
    s.temperature = Math.max(18, s.temperature - 0.2 - Math.random() * 0.1);
    s.humidity = Math.max(30, s.humidity - 0.3 - Math.random() * 0.1);
  } else {
    s.temperature += (Math.random() - 0.45) * 0.3;
    s.humidity += (Math.random() - 0.5) * 0.4;
  }

  if (a.growLight) {
    s.lightIntensity = Math.min(1500, s.lightIntensity + 40 + Math.round(Math.random() * 20));
  } else {
    s.lightIntensity = Math.max(0, s.lightIntensity - 30 - Math.round(Math.random() * 15));
  }

  s.temperature = parseFloat(Math.max(15, Math.min(45, s.temperature)).toFixed(1));
  s.humidity = parseFloat(Math.max(10, Math.min(100, s.humidity)).toFixed(1));
  s.soilMoisture = Math.round(s.soilMoisture);
  s.lightIntensity = Math.round(s.lightIntensity);
  s.timestamp = new Date();

  timeOffset += 2;
  if (timeOffset % 60 === 0) {
    if (Math.random() < 0.08) {
      state.espStatus = "offline";
      state.mqttStatus = "disconnected";
      state.wifiStrength = -100;
    } else {
      state.espStatus = "online";
      state.mqttStatus = "connected";
      state.wifiStrength = Math.round(-55 - Math.random() * 20);
    }
  }

  notify();
}

function startSimulation() {
  intervalId = setInterval(() => {
    tickSimulation();
  }, 2000);
}

export function subscribe(listener: RealtimeListener): () => void {
  listeners.add(listener);
  listener(state);
  
  if (listeners.size === 1 && !intervalId) {
    startSimulation();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

export function setActuator(key: keyof RealtimeState["actuators"], value: boolean) {
  state.actuators[key] = value;
  notify();
}

export const realtimeManager = {
  subscribe,
  setActuator,
};
