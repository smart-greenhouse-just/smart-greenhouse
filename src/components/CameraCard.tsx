"use client";

import { useState } from "react";
import { Camera, Play, Square, RefreshCw, Trash2, Download, Check, Sparkles, AlertCircle } from "lucide-react";
import { CapturedImageDetails } from "@/services/camera";

interface CameraCardProps {
  cameraOnline: boolean;
  streamActive: boolean;
  streamFrame?: string | null;
  capturedImage: CapturedImageDetails | null;
  isCapturing: boolean;
  isAnalyzing: boolean;
  onStartStream: () => void;
  onStopStream: () => void;
  onCaptureImage: () => void;
  onAnalyzeImage: () => void;
  onDeleteImage: () => void;
}

export function CameraCard({
  cameraOnline,
  streamActive,
  streamFrame,
  capturedImage,
  isCapturing,
  isAnalyzing,
  onStartStream,
  onStopStream,
  onCaptureImage,
  onAnalyzeImage,
  onDeleteImage,
}: CameraCardProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    if (!capturedImage) return;
    // Mock download by opening in a new tab
    const link = document.createElement("a");
    link.href = capturedImage.imageUrl;
    link.download = `greenhouse-snapshot-${capturedImage.id}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAnalysisBadgeColor = (status?: string) => {
    switch (status) {
      case "healthy":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "diseased":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "nutrient_deficiency":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "pest_detection":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatStatusText = (status?: string) => {
    if (!status) return "";
    return status.replace("_", " ").toUpperCase();
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          <h2 className="font-sans text-sm font-bold text-foreground">ESP32 Camera Node</h2>
        </div>
        {streamActive && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 uppercase tracking-wider relative">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping absolute" />
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 relative" />
            Live
          </span>
        )}
      </div>

      {/* Camera Stream/Preview Frame */}
      <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
        {!cameraOnline ? (
          <div className="text-center p-6 flex flex-col items-center justify-center min-h-[220px] bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 rounded-xl m-4 w-[calc(100%-2rem)]">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2.5 animate-pulse" />
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">ESP32 Camera Disconnected</h3>
            <p className="text-[10.5px] text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
              No active camera stream detected. Check the ESP32-CAM power source and verify it is connected to port 3001.
            </p>
          </div>
        ) : streamActive ? (
          <div className="relative h-full w-full">
            {streamFrame ? (
              <img
                src={streamFrame}
                alt="Live greenhouse feed"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-3">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Connecting video feed...</span>
              </div>
            )}
            {/* Visual overlay grids */}
            <div className="absolute inset-0 bg-[radial-gradient(transparent_60%,rgba(0,0,0,0.5))] pointer-events-none" />
            <div className="absolute top-4 left-4 font-mono text-[10px] text-white/80 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
              REC: 480P | 5FPS | AGC
            </div>
          </div>
        ) : capturedImage ? (
          /* Captured Image Preview */
          <div className="relative h-full w-full">
            <img
              src={capturedImage.imageUrl}
              alt="Captured snapshot"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35 pointer-events-none" />
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
              Captured: {new Date(capturedImage.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          /* Idle/Empty feed */
          <div className="text-center p-6 flex flex-col items-center">
            <Camera className="h-12 w-12 text-slate-700 mb-2 animate-bounce-slow" />
            <p className="text-xs text-slate-400 font-medium">Camera Feed Offline</p>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
              Activate the ESP32 camera node or capture a frame snapshot.
            </p>
          </div>
        )}

        {/* Capturing feedback overlay */}
        {isCapturing && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10 gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs font-semibold tracking-wider uppercase">Triggering Shutter...</span>
          </div>
        )}
      </div>

      {/* Control Buttons Panel */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/30 px-5 py-3">
        {streamActive ? (
          <button
            onClick={onStopStream}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20 cursor-pointer"
          >
            <Square className="h-3.5 w-3.5" /> Stop Stream
          </button>
        ) : (
          <button
            onClick={onStartStream}
            disabled={!cameraOnline}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" /> Start Stream
          </button>
        )}

        <button
          onClick={onCaptureImage}
          disabled={!cameraOnline || isCapturing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Camera className="h-3.5 w-3.5" /> Capture Frame
        </button>

        {capturedImage && (
          <>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Download className="h-3.5 w-3.5" />}
              {copied ? "Downloaded" : "Download"}
            </button>
            <button
              onClick={onDeleteImage}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 cursor-pointer ml-auto"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </>
        )}
      </div>

      {/* Image AI Leaf Diagnostics drawer */}
      {capturedImage && (
        <div className="p-5 bg-card">
          {!capturedImage.analysis ? (
            <div className="text-center py-4 flex flex-col items-center">
              <button
                onClick={onAnalyzeImage}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-bold text-white hover:brightness-105 shadow-md shadow-emerald-500/10 disabled:opacity-50 cursor-pointer transition-all hover:scale-102"
              >
                <Sparkles className="h-4 w-4 animate-pulse" />
                {isAnalyzing ? "AI Processing..." : "Analyze Leaf Condition"}
              </button>
              <p className="text-[10px] text-muted-foreground mt-2">
                Simulate computer-vision AI diagnostics for disease detection.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-muted/40 p-4 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5 mb-3">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-500" /> Leaf Analysis Report
                </span>
                <span className={`rounded-lg border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getAnalysisBadgeColor(capturedImage.analysis.status)}`}>
                  {formatStatusText(capturedImage.analysis.status)}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-muted-foreground">Confidence: </span>
                  <span className="font-mono font-bold text-foreground">
                    {Math.round(capturedImage.analysis.confidence * 100)}%
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">Diagnostic Detail:</span>
                  <p className="text-foreground leading-relaxed bg-card p-2.5 rounded-xl border border-border/50 font-medium">
                    {capturedImage.analysis.diagnoseResult}
                  </p>
                </div>
                <div className="flex gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-xl p-3">
                  <AlertCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Suggested Action:</span>
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                      {capturedImage.analysis.suggestedAction}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
