"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Coins } from "lucide-react";
import { SECTIONS, type SectionId } from "@/lib/config";
import { levelFromXp, moneyHealth } from "@/lib/score";
import { useMoney } from "@/context/MoneyContext";

export const jumpTo = (id: SectionId) => document.getElementById(id)?.scrollIntoView({
  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
});

export function Nav() {
  const { state } = useMoney();
  const [active, setActive] = useState<SectionId>("start");
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const update = () => {
      const room = document.documentElement.scrollHeight - window.innerHeight;
      setScroll(room > 0 ? Math.min(100, (window.scrollY / room) * 100) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id as SectionId);
    }, { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] });
    SECTIONS.forEach((id) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => { observer.disconnect(); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
      <a href="#start" className="flex shrink-0 items-center gap-2.5 font-heading text-lg font-black tracking-tight text-white focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-emerald-400" aria-label="MoneySense, back to start">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.35)]"><Coins size={20} /></span>
        <span className="hidden sm:inline">MoneySense<span className="text-emerald-400">.</span></span>
      </a>
      <nav aria-label="Main navigation" className="flex items-center gap-1 overflow-x-auto scrollbar-none sm:gap-1.5 p-1 rounded-full bg-slate-900/60 border border-white/5">
        {SECTIONS.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "location" : undefined}
            onClick={(event) => { event.preventDefault(); jumpTo(id); history.replaceState(null, "", `#${id}`); }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all focus-visible:outline-2 focus-visible:outline-emerald-400 sm:px-4 sm:text-sm ${
              active === id
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 border border-transparent"
            }`}
          >
            {id}
          </a>
        ))}
      </nav>
      <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/80 px-3.5 py-1.5 text-xs font-bold text-slate-200 shadow-sm md:inline-flex">
        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
        Level {levelFromXp(state.xp)} <ArrowUpRight size={14} className="text-emerald-400" />
      </span>
    </div>
    <div className="h-0.5 bg-slate-800/80" role="progressbar" aria-label="Page scroll progress" aria-valuenow={Math.round(scroll)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]" style={{ width: `${scroll}%` }} />
    </div>
  </header>;
}

export function FloatingScore() {
  const { state, ready } = useMoney();
  return <a href="#decide" className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-slate-900/90 backdrop-blur-xl px-4 py-3 text-sm font-semibold text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-1 hover:border-emerald-500/60 hover:shadow-[0_8px_32px_rgba(16,185,129,0.25)] focus-visible:outline-2 focus-visible:outline-emerald-400 sm:bottom-6 sm:right-6">
    <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
    <span>Money health <strong className="text-emerald-400 font-bold">{ready ? moneyHealth(state) : "—"}/100</strong></span>
  </a>;
}
