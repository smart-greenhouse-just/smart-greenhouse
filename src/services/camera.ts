export interface AnalysisResult {
  status: "healthy" | "diseased" | "nutrient_deficiency" | "pest_detection";
  confidence: number;
  diagnoseResult: string;
  suggestedAction: string;
  timestamp: Date;
}

export interface CapturedImageDetails {
  id: string;
  imageUrl: string;
  timestamp: Date;
  analysis?: AnalysisResult;
}

const activeStreams: Set<string> = new Set();

export async function startStream(deviceId: string): Promise<boolean> {
  console.log(`[Camera Service] Starting live stream for ${deviceId}...`);
  activeStreams.add(deviceId);
  return true;
}

export async function stopStream(deviceId: string): Promise<boolean> {
  console.log(`[Camera Service] Stopping live stream for ${deviceId}...`);
  activeStreams.delete(deviceId);
  return true;
}

export async function captureImage(deviceId: string): Promise<CapturedImageDetails> {
  console.log(`[Camera Service] Capturing image from ${deviceId}...`);
  throw new Error("Physical camera disconnected. Cannot capture image.");
}

export async function analyzeImage(imageId: string): Promise<AnalysisResult> {
  console.log(`[Camera Service] Analyzing leaf health for image ${imageId}...`);
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const analysisScenarios: AnalysisResult[] = [
    {
      status: "healthy",
      confidence: 0.96,
      diagnoseResult: "Optimal chlorophyll levels detected. No signs of pathogens, pests, or discoloration.",
      suggestedAction: "Maintain current climate control thresholds and watering cycles.",
      timestamp: new Date(),
    },
    {
      status: "diseased",
      confidence: 0.88,
      diagnoseResult: "Powdery mildew fungus spores identified spreading on the leaf upper surfaces.",
      suggestedAction: "Spray potassium bicarbonate or neem oil immediately. Reduce humidity levels to 55%.",
      timestamp: new Date(),
    },
    {
      status: "nutrient_deficiency",
      confidence: 0.82,
      diagnoseResult: "Interveinal chlorosis (yellowing between leaf veins) indicates potential Iron or Magnesium deficiency.",
      suggestedAction: "Supplement soil with chelated iron foliar spray and check soil pH is between 6.0 and 6.5.",
      timestamp: new Date(),
    },
    {
      status: "pest_detection",
      confidence: 0.91,
      diagnoseResult: "Spider mite fine webbing and speckled leaf chlorosis detected under lower foliage leaves.",
      suggestedAction: "Introduce predatory mites (Phytoseiulus persimilis) or treat affected crops with insecticidal soap.",
      timestamp: new Date(),
    },
  ];

  const randomIndex = Math.floor(Math.random() * analysisScenarios.length);
  return {
    ...analysisScenarios[randomIndex],
    timestamp: new Date(),
  };
}

export const cameraService = {
  startStream,
  stopStream,
  captureImage,
  analyzeImage
};
