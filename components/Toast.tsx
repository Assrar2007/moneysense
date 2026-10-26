"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMoney } from "@/context/MoneyContext";

export function Toast() {
  const { toast, dismissToast } = useMoney();
  return <div aria-live="polite" className="pointer-events-none fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 sm:bottom-6"><AnimatePresence>{toast && <motion.div key={toast.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="pointer-events-auto flex min-w-max items-center gap-4 rounded-2xl border border-emerald-500/30 bg-slate-900/95 backdrop-blur-xl px-5 py-3 text-sm font-semibold text-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.6)]"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-400 animate-ping" />{toast.message}</span><button onClick={dismissToast} aria-label="Dismiss notification" className="rounded p-1 text-slate-400 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400"><X size={16} /></button></motion.div>}</AnimatePresence></div>;
}
