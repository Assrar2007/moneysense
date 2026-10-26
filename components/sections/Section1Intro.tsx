"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { jumpTo } from "@/components/Nav";
import { useMoney } from "@/context/MoneyContext";
import { FRAME_COUNT, framePath } from "@/lib/config";

const beats = [
  { title: "Make money make sense.", body: "A clearer way to learn, spend, grow and decide. Start with one simple idea: every rupee has a story.", kicker: "Your money, made clear" },
  { title: "Money comes in.", body: "A salary, a side gig, a first paycheck. Know what you earn before you decide what to do with it.", kicker: "01 / Earn" },
  { title: "Money goes out.", body: "UPI taps and monthly bills add up. See where it goes and choose what matters to you.", kicker: "02 / Spend" },
  { title: "Money grows.", body: "Save for the unexpected. Give long-term goals time and regular contributions to grow.", kicker: "03 / Grow" },
  { title: "Money decides.", body: "A purchase, an EMI, a SIP. Compare the choices with numbers you understand.", kicker: "04 / Decide" },
  { title: "Your next move starts here.", body: "Explore the basics or jump straight into your money tools. You can change your plan as you learn.", kicker: "Make money make sense" },
] as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const beatAt = (progress: number) => progress < 0.15 ? 0 : progress < 0.32 ? 1 : progress < 0.50 ? 2 : progress < 0.68 ? 3 : progress < 0.85 ? 4 : 5;

function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;
  ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
}

function drawFallback(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#070B14");
  gradient.addColorStop(0.5, "#0B132B");
  gradient.addColorStop(1, "#06281E");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const mobile = width < 720;
  const x = width * (mobile ? 0.65 : 0.75);
  const y = height * (mobile ? 0.35 : 0.50);
  const radius = Math.min(width * 0.2, height * 0.25, 200);

  const halo = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 2.5);
  halo.addColorStop(0, "rgba(16, 185, 129, 0.25)");
  halo.addColorStop(1, "rgba(16, 185, 129, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(x - radius * 2.5, y - radius * 2.5, radius * 5, radius * 5);

  ctx.save();
  ctx.translate(x, y);
  const coin = ctx.createLinearGradient(-radius, -radius, radius, radius);
  coin.addColorStop(0, "#34D399");
  coin.addColorStop(1, "#059669");
  ctx.fillStyle = coin;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#020617";
  ctx.font = `800 ${Math.round(radius * 1.1)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("₹", 0, radius * 0.05);
  ctx.restore();
}

export default function Section1Intro() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [beat, setBeat] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const { dispatch } = useMoney();

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!section || !canvas || !ctx) return;

    let disposed = false;
    let raf = 0;
    let progress = 0;
    let lastBeat = -1;
    const images = new Map<number, HTMLImageElement>();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const draw = () => {
      raf = 0;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;

      const target = reduced.matches ? 1 : Math.min(FRAME_COUNT, Math.max(1, 1 + Math.round(progress * (FRAME_COUNT - 1))));
      let selected: HTMLImageElement | undefined = images.get(target);

      if (!selected && images.size > 0) {
        let nearestDist = FRAME_COUNT + 1;
        images.forEach((img, idx) => {
          const dist = Math.abs(idx - target);
          if (dist < nearestDist) {
            nearestDist = dist;
            selected = img;
          }
        });
      }

      if (selected && selected.complete && selected.naturalWidth > 0) {
        drawCover(ctx, selected, width, height);
      } else {
        drawFallback(ctx, width, height);
      }

      const nextBeat = beatAt(progress);
      if (nextBeat !== lastBeat) {
        lastBeat = nextBeat;
        setBeat(nextBeat);
      }
    };

    const schedule = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      schedule();
    };

    const onScroll = () => {
      const length = Math.max(1, section.offsetHeight - window.innerHeight);
      progress = clamp(-section.getBoundingClientRect().top / length);
      schedule();
    };

    // Load first frame immediately
    const firstImg = new Image();
    firstImg.onload = () => {
      if (disposed) return;
      images.set(1, firstImg);
      schedule();
      loadRemainingFrames();
    };
    firstImg.onerror = () => {
      if (!disposed) schedule();
    };
    firstImg.src = framePath(1);

    // Progressive loader: load keyframes every 4 frames first for fast coverage, then fill remainder
    const loadRemainingFrames = () => {
      if (disposed || reduced.matches) return;

      const priorityIndices: number[] = [];
      const secondaryIndices: number[] = [];

      for (let i = 2; i <= FRAME_COUNT; i++) {
        if (i % 4 === 0) priorityIndices.push(i);
        else secondaryIndices.push(i);
      }

      const allToLoad = [...priorityIndices, ...secondaryIndices];
      let cursor = 0;
      let inFlight = 0;
      const MAX_CONCURRENT = 6;

      const pump = () => {
        if (disposed) return;
        while (inFlight < MAX_CONCURRENT && cursor < allToLoad.length) {
          const idx = allToLoad[cursor++];
          inFlight++;
          const img = new Image();
          img.onload = () => {
            inFlight--;
            if (!disposed) {
              images.set(idx, img);
              setLoadedCount(images.size);
              schedule();
              pump();
            }
          };
          img.onerror = () => {
            inFlight--;
            if (!disposed) pump();
          };
          img.src = framePath(idx);
        }
      };

      pump();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("scroll", onScroll, { passive: true });
    reduced.addEventListener("change", onScroll);
    resize();
    onScroll();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      reduced.removeEventListener("change", onScroll);
      firstImg.onload = null;
      firstImg.onerror = null;
      images.clear();
    };
  }, []);

  const current = beats[beat];

  return <section id="start" ref={sectionRef} className="relative h-[480svh]" aria-label="Start: understand your money">
    <div className="sticky top-16 h-[calc(100svh-4rem)] min-h-[34rem] overflow-hidden bg-slate-950">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full object-cover" />
      {/* Visual atmospheric gradient overlay leaving space for original text and controls */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent md:from-slate-950/85 md:via-slate-950/40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-12 pt-8 sm:px-8 sm:pb-16 md:justify-center">
        <div className="max-w-2xl rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl shadow-soft sm:p-9 md:bg-slate-950/40 md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[.2em] text-emerald-400">
            <Sparkles size={14} className="animate-spin text-emerald-400" />
            {current.kicker}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={beat}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -15 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              <h1 className="font-heading text-[clamp(2.6rem,6.5vw,5.5rem)] font-black leading-[1.05] tracking-[-.045em] text-white">
                {current.title}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                {current.body}
              </p>
            </motion.div>
          </AnimatePresence>

          {beat === 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => jumpTo("explore")}>
                Start exploring <ArrowRight size={17} />
              </Button>
              <Button variant="secondary" onClick={() => dispatch({ type: "demo" })}>
                <Download size={16} /> Load demo data
              </Button>
            </div>
          )}

          {beat === 5 && (
            <div className="mt-8 flex flex-wrap gap-2.5">
              {(["explore", "spend", "grow", "decide"] as const).map((id) => (
                <Button key={id} variant={id === "explore" ? "primary" : "secondary"} onClick={() => jumpTo(id)}>
                  {id[0].toUpperCase() + id.slice(1)} <ArrowRight size={15} />
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.2em] text-slate-400 md:absolute md:bottom-10">
          <ArrowDown size={15} className="animate-bounce text-emerald-400" />
          <span>Scroll to follow your money</span>
        </div>
      </div>

      {loadedCount < FRAME_COUNT && (
        <div role="status" className="absolute right-5 top-5 rounded-full border border-white/10 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-emerald-400 shadow-sm">
          Scene frames {Math.round((loadedCount / FRAME_COUNT) * 100)}%
        </div>
      )}

      <div aria-hidden="true" className="absolute bottom-0 left-0 h-1 w-full bg-slate-900">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_#10B981]" style={{ width: `${beat === 0 ? 0 : beat * 20}%` }} />
      </div>
    </div>
  </section>;
}

