import { NextResponse } from "next/server";
import { dbConnect } from "@/services/database";
import { CameraAnalysis } from "@/models/CameraAnalysis";

export async function POST(request: Request) {
  try {
    const { imageId } = await request.json();
    if (!imageId) {
      return NextResponse.json({ error: "Missing imageId parameter" }, { status: 400 });
    }

    await dbConnect();

    const analysisScenarios = [
      {
        status: "healthy" as const,
        confidence: 0.96,
        diagnoseResult: "Optimal chlorophyll levels detected. No signs of pathogens, pests, or discoloration.",
        suggestedAction: "Maintain current climate control thresholds and watering cycles.",
      },
      {
        status: "diseased" as const,
        confidence: 0.88,
        diagnoseResult: "Powdery mildew fungus spores identified spreading on the leaf upper surfaces.",
        suggestedAction: "Spray potassium bicarbonate or neem oil immediately. Reduce humidity levels to 55%.",
      },
      {
        status: "nutrient_deficiency" as const,
        confidence: 0.82,
        diagnoseResult: "Interveinal chlorosis (yellowing between leaf veins) indicates potential Iron or Magnesium deficiency.",
        suggestedAction: "Supplement soil with chelated iron foliar spray and check soil pH is between 6.0 and 6.5.",
      },
      {
        status: "pest_detection" as const,
        confidence: 0.91,
        diagnoseResult: "Spider mite fine webbing and speckled leaf chlorosis detected under lower foliage leaves.",
        suggestedAction: "Introduce predatory mites (Phytoseiulus persimilis) or treat affected crops with insecticidal soap.",
      },
    ];

    const index = Math.floor(Math.random() * analysisScenarios.length);
    const selected = analysisScenarios[index];

    const analysis = new CameraAnalysis({
      imageId,
      status: selected.status,
      confidence: selected.confidence,
      diagnoseResult: selected.diagnoseResult,
      suggestedAction: selected.suggestedAction,
      timestamp: new Date(),
    });

    await analysis.save();

    return NextResponse.json({
      status: analysis.status,
      confidence: analysis.confidence,
      diagnoseResult: analysis.diagnoseResult,
      suggestedAction: analysis.suggestedAction,
      timestamp: analysis.timestamp,
    });

  } catch (e: unknown) {
    console.error("[Camera Analyze API] Error:", e);
    const msg = e instanceof Error ? e.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
