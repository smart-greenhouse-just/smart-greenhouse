import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISensorItem {
  sensorId: number | string;
  value: number;
  unit?: string;
}

export interface ISensorMetric {
  totalSensors: number;
  sensors: ISensorItem[];
}

export type MetricValueInput = ISensorMetric | number | number[] | { sensorId?: number | string; sensorID?: number | string; value?: number; data?: number; unit?: string }[] | undefined | null;

export interface ISensorLog extends Document {
  deviceId: string;
  temperature: ISensorMetric | number | number[];
  humidity: ISensorMetric | number | number[];
  soilMoisture: ISensorMetric | number | number[];
  lightIntensity: ISensorMetric | number | number[];
  timestamp: Date;
}

const SensorLogSchema: Schema = new Schema(
  {
    deviceId: { type: String, required: true, index: true },
    temperature: { type: Schema.Types.Mixed, required: true },
    humidity: { type: Schema.Types.Mixed, required: true },
    soilMoisture: { type: Schema.Types.Mixed, required: true },
    lightIntensity: { type: Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const SensorLog: Model<ISensorLog> =
  mongoose.models.SensorLog ||
  mongoose.model<ISensorLog>("SensorLog", SensorLogSchema);

export function getSensorAverage(val: unknown): number {
  if (val === undefined || val === null) return 0;

  // If it's the structured multi-sensor object: { totalSensors: N, sensors: [...] }
  if (typeof val === "object" && val !== null && !Array.isArray(val)) {
    const metric = val as Record<string, unknown>;
    if (Array.isArray(metric.sensors) && metric.sensors.length > 0) {
      const values = metric.sensors
        .map((s: unknown) => {
          if (typeof s === "object" && s !== null) {
            const item = s as Record<string, unknown>;
            const v = item.value !== undefined ? item.value : item.data;
            const num = Number(v);
            return isNaN(num) ? null : num;
          }
          const num = Number(s);
          return isNaN(num) ? null : num;
        })
        .filter((v): v is number => v !== null);

      if (values.length > 0) {
        const sum = values.reduce((acc, curr) => acc + curr, 0);
        return parseFloat((sum / values.length).toFixed(2));
      }
    }
  }

  // If it's a simple array of numbers or objects
  if (Array.isArray(val)) {
    if (val.length === 0) return 0;
    const values = val
      .map((item: unknown) => {
        if (typeof item === "object" && item !== null) {
          const s = item as Record<string, unknown>;
          const v = s.value !== undefined ? s.value : s.data;
          const num = Number(v);
          return isNaN(num) ? null : num;
        }
        const num = Number(item);
        return isNaN(num) ? null : num;
      })
      .filter((v): v is number => v !== null);

    if (values.length > 0) {
      const sum = values.reduce((acc, curr) => acc + curr, 0);
      return parseFloat((sum / values.length).toFixed(2));
    }
    return 0;
  }

  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

export function getSensorCount(val: unknown): number {
  if (val === undefined || val === null) return 1;
  if (typeof val === "object" && val !== null && !Array.isArray(val)) {
    const metric = val as Record<string, unknown>;
    if (typeof metric.totalSensors === "number") {
      return metric.totalSensors;
    }
    if (Array.isArray(metric.sensors)) {
      return metric.sensors.length;
    }
  }
  if (Array.isArray(val)) {
    return val.length;
  }
  return 1;
}

export function normalizeSensorMetric(
  raw: unknown,
  defaultUnit: string,
  defaultValue: number
): ISensorMetric {
  if (raw === undefined || raw === null) {
    return {
      totalSensors: 1,
      sensors: [{ sensorId: 1, value: defaultValue, unit: defaultUnit }],
    };
  }

  // Check if it's already an ISensorMetric object
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.sensors)) {
      const normalizedSensors: ISensorItem[] = obj.sensors.map((s, idx) => {
        if (typeof s === "object" && s !== null) {
          const item = s as Record<string, unknown>;
          const sId = item.sensorId ?? item.sensorID ?? (idx + 1);
          const val = item.value ?? item.data ?? defaultValue;
          const unit = typeof item.unit === "string" ? item.unit : defaultUnit;
          return {
            sensorId: typeof sId === "number" || typeof sId === "string" ? sId : (idx + 1),
            value: Number(val),
            unit,
          };
        }
        return {
          sensorId: idx + 1,
          value: Number(s),
          unit: defaultUnit,
        };
      });

      return {
        totalSensors: typeof obj.totalSensors === "number" ? obj.totalSensors : normalizedSensors.length,
        sensors: normalizedSensors,
      };
    }
  }

  // If it's an array
  if (Array.isArray(raw)) {
    const normalizedSensors: ISensorItem[] = raw.map((item, idx) => {
      if (typeof item === "object" && item !== null) {
        const s = item as Record<string, unknown>;
        const sId = s.sensorId ?? s.sensorID ?? (idx + 1);
        const val = s.value ?? s.data ?? defaultValue;
        const unit = typeof s.unit === "string" ? s.unit : defaultUnit;
        return {
          sensorId: typeof sId === "number" || typeof sId === "string" ? sId : (idx + 1),
          value: Number(val),
          unit,
        };
      }
      return {
        sensorId: idx + 1,
        value: Number(item),
        unit: defaultUnit,
      };
    });

    return {
      totalSensors: normalizedSensors.length,
      sensors: normalizedSensors,
    };
  }

  // Single scalar number or string number
  const num = Number(raw);
  return {
    totalSensors: 1,
    sensors: [
      {
        sensorId: 1,
        value: isNaN(num) ? defaultValue : num,
        unit: defaultUnit,
      },
    ],
  };
}


