export interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightIntensity: number;
  timestamp: Date;
}

export async function getCurrentData(deviceId: string): Promise<SensorData> {
  const history = await getHistory(deviceId, "24h");
  return history[history.length - 1] || {
    temperature: 24.0,
    humidity: 60.0,
    soilMoisture: 40,
    lightIntensity: 300,
    timestamp: new Date(),
  };
}

export async function getHistory(_deviceId: string, timeframe: string): Promise<SensorData[]> {
  try {
    const res = await fetch(`/api/sensors/history?timeframe=${timeframe}`);
    if (!res.ok) {
      throw new Error("Failed to fetch historical sensor log logs");
    }
    const data = await res.json();
    return data.map((d: { timestamp: string }) => ({
      ...d,
      timestamp: new Date(d.timestamp),
    }));
  } catch (e) {
    console.error("[Sensor Service] Error fetching history:", e);
    return [];
  }
}

export async function logData(deviceId: string, data: SensorData): Promise<boolean> {
  console.log(`[Sensor Service] Logging data for ${deviceId}:`, data);
  return true;
}

export const sensorService = {
  getCurrentData,
  getHistory,
  logData
};
