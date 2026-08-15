import { SensorData } from "./sensor";
import { ISensorMetric } from "@/models/SensorLog";

export interface RealtimeState {
  espStatus: "online" | "offline";
  cameraStatus: "online" | "offline";
  wifiStrength: number;
  mqttStatus: "connected" | "disconnected";
  dbStatus: "connected" | "disconnected";
  sensors: SensorData;
  sensorDetails?: {
    temperature?: ISensorMetric;
    humidity?: ISensorMetric;
    soilMoisture?: ISensorMetric;
    lightIntensity?: ISensorMetric;
  };
  actuators: {
    pump: boolean;
    growLight: boolean;
    fan: boolean;
  };
}

export type RealtimeListener = (state: RealtimeState) => void;

const listeners = new Set<RealtimeListener>();

const state: RealtimeState = {
  espStatus: "offline",
  cameraStatus: "offline",
  wifiStrength: -100,
  mqttStatus: "connected",
  dbStatus: "connected",
  sensors: {},
  actuators: {
    pump: false,
    growLight: false,
    fan: false,
  },
};

function notify() {
  listeners.forEach((l) => l({ ...state }));
}

export function updateRealtimeState(newState: Partial<RealtimeState>) {
  Object.assign(state, newState);
  notify();
}

export function subscribe(listener: RealtimeListener): () => void {
  listeners.add(listener);
  listener(state);

  return () => {
    listeners.delete(listener);
  };
}

export function setActuator(key: keyof RealtimeState["actuators"], value: boolean) {
  state.actuators[key] = value;
  notify();
}

export const realtimeManager = {
  subscribe,
  setActuator,
  updateRealtimeState,
};
