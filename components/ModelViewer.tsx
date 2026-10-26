"use client";

import { useState } from "react";
import { Eye, RotateCcw, Sparkles } from "lucide-react";
import { useReducedMotion } from "framer-motion";

export function ModelViewer() {
  const reduced = useReducedMotion();
  const [autoRotate, setAutoRotate] = useState(!reduced);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
            <Sparkles size={14} className="text-emerald-400" />
            3D Money Asset
          </div>
          <h3 className="mt-2 font-heading text-xl font-bold text-white sm:text-2xl">
            Interactive MoneySense Vault
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Drag to rotate, pinch or scroll to zoom, inspect the 3D geometry in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            aria-pressed={autoRotate}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-emerald-400 ${
              autoRotate
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
            }`}
          >
            <RotateCcw size={13} className={autoRotate ? "animate-spin" : ""} />
            {autoRotate ? "Auto-orbiting" : "Paused"}
          </button>
        </div>
      </div>

      <div className="relative mt-6 h-80 sm:h-96 w-full rounded-2xl bg-slate-950/60 border border-white/5 overflow-hidden flex items-center justify-center">
        {/* Ambient atmospheric glow behind model */}
        <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-emerald-500/10 via-transparent to-transparent" />
        
        {/* Model-viewer custom element */}
        <model-viewer
          src="/assets/models/510a5510900b4dcbb8516f424e56adae.glb"
          alt="MoneySense 3D interactive model"
          auto-rotate={autoRotate && !reduced ? "" : undefined}
          camera-controls
          touch-action="pan-y"
          interaction-prompt="none"
          shadow-intensity="1.5"
          exposure="1.0"
          style={{ width: "100%", height: "100%" }}
        >
          <div slot="poster" className="grid size-full place-items-center text-slate-400 text-sm">
            <div className="flex flex-col items-center gap-2">
              <Eye size={24} className="text-emerald-400 animate-pulse" />
              <span>Loading 3D asset…</span>
            </div>
          </div>
        </model-viewer>
      </div>
    </div>
  );
}
