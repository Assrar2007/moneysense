export const FRAME_COUNT = 539;
export const framePath = (index: number): string =>
  `/assets/hero-frames/frame_${String(Math.min(FRAME_COUNT, Math.max(1, Math.trunc(index) || 1))).padStart(4, "0")}.webp`;

export const STORAGE_KEY = "moneysense:v1";
export const SECTIONS = ["start", "explore", "spend", "grow", "decide"] as const;
export type SectionId = (typeof SECTIONS)[number];
