"use client";

import { RotateCcw } from "lucide-react";
import { Nav, FloatingScore } from "@/components/Nav";
import { CursorGlow } from "@/components/CursorGlow";
import { SectionBoundary } from "@/components/SectionBoundary";
import { Toast } from "@/components/Toast";
import { useMoney } from "@/context/MoneyContext";
import Section1Intro from "@/components/sections/Section1Intro";
import Section2Explore from "@/components/sections/Section2Explore";
import Section3Spend from "@/components/sections/Section3Spend";
import Section4Grow from "@/components/sections/Section4Grow";
import Section5Decide from "@/components/sections/Section5Decide";

export default function Home() {
  const { dispatch } = useMoney();
  return <>
    <Nav />
    <main>
      <SectionBoundary name="Start"><Section1Intro /></SectionBoundary>
      <SectionBoundary name="Explore"><Section2Explore /></SectionBoundary>
      <SectionBoundary name="Spend"><Section3Spend /></SectionBoundary>
      <SectionBoundary name="Grow"><Section4Grow /></SectionBoundary>
      <SectionBoundary name="Decide"><Section5Decide /></SectionBoundary>
      <footer className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/10 px-4 py-12 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span className="font-heading font-extrabold text-white">
          MoneySense<span className="text-emerald-400">.</span>{" "}
          <span className="ml-2 font-sans font-normal text-slate-400">Make money make sense.</span>
        </span>
        <button
          type="button"
          onClick={() => dispatch({ type: "reset" })}
          className="flex items-center gap-2 self-start rounded-xl px-3 py-1.5 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400"
        >
          <RotateCcw size={15} /> Reset my data
        </button>
      </footer>
    </main>
    <CursorGlow />
    <FloatingScore />
    <Toast />
  </>;
}
