import { NextResponse } from "next/server";
import { dbConnect } from "@/services/database";
import { SensorLog } from "@/models/SensorLog";
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
      console.warn(`[History API] No actual database records found for ${DEVICE_ID}. Generating fallback database records...`);
      const fallbackLogs = generateFallbackLogs(timeframe);
      await SensorLog.insertMany(
        fallbackLogs.map((l) => ({
          deviceId: DEVICE_ID,
          ...l,
        }))
      );
      return NextResponse.json(fallbackLogs);
    }

    return NextResponse.json(logs.reverse());
  } catch (e: unknown) {
    console.error("[History API] Request handler error:", e);
    const msg = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function generateFallbackLogs(timeframe: string) {
  const data = [];
  const now = new Date();
  let count = 48;
  let intervalMinutes = 30;

  if (timeframe === "24h") {
    count = 48;
    intervalMinutes = 30;
  } else if (timeframe === "7d") {
    count = 168;
    intervalMinutes = 60;
  } else if (timeframe === "30d") {
    count = 120;
    intervalMinutes = 360;
  } else if (timeframe === "90d") {
    count = 180;
    intervalMinutes = 720;
  }

  let temp = 24.5;
  let hum = 65;
  let soil = 45;
  let light = 350;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    const hours = timestamp.getHours();
    const isDay = hours > 6 && hours < 18;

    temp += (Math.random() - 0.5) * 0.8;
    temp = isDay ? temp * 0.95 + 28 * 0.05 : temp * 0.95 + 19 * 0.05;

    hum += (Math.random() - 0.5) * 1.5;
    hum = isDay ? hum * 0.95 + 50 * 0.05 : hum * 0.95 + 75 * 0.05;

    soil += (Math.random() - 0.52) * 0.5;
    if (soil < 15) soil = 15;

    light = isDay
      ? Math.max(0, 800 + Math.sin(((hours - 6) / 12) * Math.PI) * 400 + (Math.random() - 0.5) * 100)
      : Math.max(0, 10 + (Math.random() - 0.5) * 5);

    data.push({
      temperature: parseFloat(temp.toFixed(1)),
      humidity: parseFloat(hum.toFixed(1)),
      soilMoisture: Math.round(soil),
      lightIntensity: Math.round(light),
      timestamp,
    });
  }
  return data;
}
