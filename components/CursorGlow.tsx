"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let x = 0, y = 0;
    const move = (event: PointerEvent) => {
      x = event.clientX; y = event.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        if (ref.current) ref.current.style.transform = `translate3d(${x - 180}px, ${y - 180}px, 0)`;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-10 hidden size-[420px] rounded-full opacity-40 blur-2xl lg:block" style={{ background: "radial-gradient(circle, rgba(16,185,129,.18), transparent 70%)" }} />;
}
