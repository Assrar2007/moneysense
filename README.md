# MoneySense

**Make money make sense.** A one-page, interactive MoneyMatters website for students and first-time earners in India.

## Team Members

- Team name: **Moggerz**
- Members: **Assrar & Yusuf**

## Project Description

MoneySense connects five steps: **Start** explains the money journey through a scroll-driven canvas; **Explore** offers searchable, short lessons and a beginner roadmap; **Spend** manages income, transactions, category budgets, recurring payments and CSV export; **Grow** tracks goals and models savings, FD, equity and inflation assumptions; **Decide** compares purchases, EMIs and allocation choices, then saves a printable plan. A live Money Health Score, XP and badges respond to local actions.

All values use ₹ and `en-IN` formatting. The site is educational. Investment returns, health score and allocations are illustrations, not guarantees or personalised financial advice.

## Run locally

Use Node.js 20.9 or newer.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Verify with:

```bash
npm run lint
npm run build
```

The production build is a static export in `out/`. There is no backend, database, API key, or runtime request to an external service. On the first build, `next/font/google` downloads Plus Jakarta Sans and Inter; Next.js then serves those font files from the built site.

## Hero Scroll-Scrubbing Frames

The hero canvas uses **539 optimized WebP frames** (`frame_0001.webp` through `frame_0539.webp`) located in `public/assets/hero-frames/`.
- Extracted locally at 30 fps from source video clips (`Budget` and `Saving`).
- Deduplicated the shared transition frame between Budget frame 300 and Saving frame 1 for seamless continuity.
- Scroll-driven frame progression on HTML5 Canvas without video playback or autoplay overhead.
- Includes progressive milestone preloading, nearest-frame caching, and `prefers-reduced-motion` accessible fallbacks.

## Interactive 3D Model

The **Grow** section features an interactive 3D model (`510a5510900b4dcbb8516f424e56adae.glb`) loaded via Google's `<model-viewer>` web component with full orbit controls and dark-themed styling.

## Data and controls

All personal entries stay in this browser's `localStorage` under the versioned `moneysense:v1` key. The first visit starts with illustrative demo data. **Load demo data** replaces local entries with the sample; **Reset my data** clears them. CSV export downloads transactions. Printing the saved Money Plan opens the browser print dialog, where **Save as PDF** may be selected.

Rates in Grow and Decide are editable assumptions. Growth math compounds monthly and assumes end-of-month contributions. The inflation hurdle is an illustrative comparison; taxes, fees and uncertain market returns are excluded. For exact financial decisions, check the terms of the actual product.

## Architecture

- Next.js 14 App Router, strict TypeScript, Tailwind CSS 3.4
- Framer Motion 11 for interaction; Recharts 2 for charts; Lucide for icons
- Section components in `components/sections/`; each has an error boundary in `app/page.tsx`
- Pure calculations in `lib/finance.ts`; state, validation, demo data, XP and local storage in `context/MoneyContext.tsx`
- No remote images; illustrations use canvas, CSS and inline SVG

## AI Tools Used

- ChatGPT Codex: design direction, implementation, code review and build/browser QA
- Other tools used by the team: **[FILL IN, if any]**

## Important Prompts Used

- Original MoneySense competition brief specifying the five sections, design, pinned stack, India focus and reliability rules.
- Phase-by-phase instruction, followed by the request to complete all remaining phases in one run.
- Additional team prompts: **[FILL IN, if any]**

## AI-Generated Code That Was Modified

**[FILL IN — describe code your team actually changed after generation, by file and reason. Do not claim changes you did not make.]**

## Bug Solved Independently

**[FILL IN — describe a bug a team member independently found and solved, including its symptom, cause and fix. Do not claim an AI-assisted fix as independent work.]**

## Deploy on Vercel

Import the repository into Vercel as a Next.js project. Keep the default build command (`npm run build`); the static export uses `output: "export"`. No environment variables are needed. Publish the deployment and test local data and print behavior in the deployed HTTPS origin. Browser-local data does not transfer between devices or origins.

## QA checklist

- [x] `npm run lint` and `npm run build` completed without errors in the final project
- [x] Zero-frame canvas fallback, scroll beats and anchor navigation inspected in browser
- [x] Expense addition and persistence, goal creation, risk quiz and decision lock exercised in browser
- [ ] Test the teammate's actual image sequence after it is delivered
- [ ] Replace team and independent-work placeholders honestly before competition submission
