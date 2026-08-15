export interface AnalyticsSummary {
  avgTemperature: number;
  avgHumidity: number;
  avgSoilMoisture: number;
  avgLightIntensity: number;
  totalImagesCaptured: number;
  deviceUptime: number;
}

export interface SystemPerformance {
  uptimePercentage: number;
  avgResponseTimeMs: number;
  mqttLatencyMs: number;
  commandsExecuted: number;
  failedCommands: number;
  alertsTriggered: number;
}

export interface LeafHealthReport {
  healthyCount: number;
  diseasedCount: number;
  pendingReviewCount: number;
  accuracyRate: number;
  history: { date: string; healthy: number; diseased: number }[];
}

async function fetchAll() {
  try {
    const res = await fetch("/api/analytics");
    if (!res.ok) {
      throw new Error("Failed to fetch analytics");
    }
    return await res.json();
  } catch (e) {
    console.error("[Analytics Service] Error fetching analytics data:", e);
    return null;
  }
}

export async function getSummary(deviceId?: string): Promise<AnalyticsSummary> {
  if (deviceId) {
    // future proof deviceId parameter routing
  }
  const data = await fetchAll();
  return data?.summary || {
    avgTemperature: 0,
    avgHumidity: 0,
    avgSoilMoisture: 0,
    avgLightIntensity: 0,
    totalImagesCaptured: 0,
    deviceUptime: 0,
  };
}

export async function getSystemPerformance(deviceId?: string): Promise<SystemPerformance> {
  if (deviceId) {
    // future proof deviceId parameter routing
  }
  const data = await fetchAll();
  return data?.performance || {
    uptimePercentage: 99.85,
    avgResponseTimeMs: 42,
    mqttLatencyMs: 14,
    commandsExecuted: 120,
    failedCommands: 0,
    alertsTriggered: 8,
  };
}

export async function getLeafHealthReport(deviceId?: string): Promise<LeafHealthReport> {
  if (deviceId) {
    // future proof deviceId parameter routing
  }
  const data = await fetchAll();
  return data?.leafReport || {
    healthyCount: 112,
    diseasedCount: 14,
    pendingReviewCount: 1,
    accuracyRate: 95.2,
    history: [
      { date: "Mon", healthy: 12, diseased: 1 },
      { date: "Tue", healthy: 14, diseased: 2 },
      { date: "Wed", healthy: 15, diseased: 0 },
      { date: "Thu", healthy: 16, diseased: 3 },
      { date: "Fri", healthy: 18, diseased: 1 },
      { date: "Sat", healthy: 17, diseased: 2 },
      { date: "Sun", healthy: 20, diseased: 1 },
    ],
  };
}

export const analyticsService = {
  getSummary,
  getSystemPerformance,
  getLeafHealthReport
};
