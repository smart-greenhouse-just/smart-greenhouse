import { NextResponse } from "next/server";
import { dbConnect } from "@/services/database";
import { SensorLog, getSensorAverage } from "@/models/SensorLog";
import "@/services/websocketServer";

const DEVICE_ID = process.env.NEXT_PUBLIC_DEVICE_ID || "esp32-greenhouse-01";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "24h";

    await dbConnect();

    const now = new Date();
    let startDate = new Date();

    if (timeframe === "24h") {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "90d") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const logs = await SensorLog.find({
      deviceId: DEVICE_ID,
      timestamp: { $gte: startDate },
    })
      .sort({ timestamp: -1 })
      .limit(1000)
      .lean();

    if (logs.length === 0) {
      return NextResponse.json([]);
    }

    const formattedLogs = logs.map((log) => ({
      ...log,
      temperature: getSensorAverage(log.temperature),
      humidity: getSensorAverage(log.humidity),
      soilMoisture: getSensorAverage(log.soilMoisture),
      lightIntensity: getSensorAverage(log.lightIntensity),
    }));

    return NextResponse.json(formattedLogs.reverse());
  } catch (e: unknown) {
    console.error("[History API] Request handler error:", e);
    const msg = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
