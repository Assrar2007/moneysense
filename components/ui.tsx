"use client";

import { animate, motion, useMotionValue, useReducedMotion, useSpring, type HTMLMotionProps } from "framer-motion";
import { useEffect, useState, type HTMLAttributes } from "react";
import { rupees } from "@/lib/finance";

export function Button({ className = "", children, type = "button", variant = "primary", onPointerMove, onPointerLeave, style, ...props }: HTMLMotionProps<"button"> & { variant?: "primary" | "secondary" | "ghost" }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0), y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 22 });
  const springY = useSpring(y, { stiffness: 280, damping: 22 });

  const tone = variant === "secondary"
    ? "border border-slate-700/80 bg-slate-900/80 text-slate-100 hover:bg-slate-800/90 hover:border-slate-600 hover:text-white"
    : variant === "ghost"
    ? "border border-transparent bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
    : "bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.35)] border border-emerald-400/50";

  return <motion.button type={type} style={{ ...style, x: springX, y: springY }} whileTap={{ scale: reduced ? 1 : 0.97 }} transition={{ duration: 0.15 }} onPointerMove={(event) => {
    if (!reduced && event.pointerType === "mouse" && !props.disabled) { const rect = event.currentTarget.getBoundingClientRect(); x.set((event.clientX - rect.left - rect.width / 2) * 0.12); y.set((event.clientY - rect.top - rect.height / 2) * 0.12); }
    onPointerMove?.(event);
  }} onPointerLeave={(event) => { x.set(0); y.set(0); onPointerLeave?.(event); }} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 ${tone} ${className}`} {...props}>{children}</motion.button>;
}

export function MoneyCounter({ value, ready = true }: { value: number; ready?: boolean }) {
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!ready) return;
    if (reduced) { setDisplay(value); return; }
    const control = animate(display, value, { duration: 0.7, onUpdate: setDisplay });
    return () => control.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ready, reduced]);
  return <span aria-label={ready ? rupees(value) : "Loading"}><span aria-hidden="true">{ready ? rupees(display) : "₹—"}</span></span>;
}

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLElement>) {
  return <article className={`rounded-3xl border border-white/10 bg-slate-900/75 backdrop-blur-xl p-6 shadow-soft transition-all duration-300 hover:border-white/15 ${className}`} {...props}>{children}</article>;
}

export function Progress({ value, label }: { value: number; label: string }) {
  const width = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return <div aria-label={label} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(width)} className="h-2.5 overflow-hidden rounded-full bg-slate-800/80 border border-white/5"><motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.7 }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)] motion-reduce:transition-none" /></div>;
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="max-w-2xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 backdrop-blur-sm">{eyebrow}</div><h2 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h2><p className="mt-4 text-base leading-7 text-slate-300">{description}</p></div>;
}

