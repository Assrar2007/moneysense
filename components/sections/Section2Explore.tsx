"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ChevronDown, Lightbulb, Search, Sparkles } from "lucide-react";
import { jumpTo } from "@/components/Nav";
import { Card, SectionHeading } from "@/components/ui";
import { useMoney } from "@/context/MoneyContext";
import { levelFromXp } from "@/lib/score";
import type { SectionId } from "@/lib/config";

const categories = ["All", "Earning", "Spending", "Saving", "Budgeting", "Investing", "Protecting"] as const;
type Category = (typeof categories)[number];
type Lesson = { title: string; category: Exclude<Category, "All">; intro: string; body: string; action: string; tool: SectionId };

const lessons: Lesson[] = [
  { title: "Read your first payslip", category: "Earning", intro: "Your CTC and take-home pay are different numbers.", body: "CTC can include employer contributions and benefits. Take-home pay is what reaches your account after applicable deductions. Build a budget from the amount you actually receive, and check each payslip for changes.", action: "Set up income", tool: "spend" },
  { title: "Plan irregular income", category: "Earning", intro: "Side-gig money may not arrive on a schedule.", body: "Use a conservative average of recent months for fixed commitments. Keep a buffer for quiet months and move part of a good month into that buffer before increasing everyday spending.", action: "Set up income", tool: "spend" },
  { title: "Track UPI without guilt", category: "Spending", intro: "Small transfers can hide a big monthly total.", body: "Log a week of UPI payments by category. Look for a repeat pattern, not one-off treats. Pick one change that still leaves room for things you enjoy.", action: "Track an expense", tool: "spend" },
  { title: "Understand an EMI", category: "Spending", intro: "A smaller monthly payment can mean a bigger total cost.", body: "Compare the cash price with the down payment, every instalment, fees and interest. Check whether the EMI still fits after essentials and savings. Missing payments can add charges and hurt your credit history.", action: "Compare a decision", tool: "decide" },
  { title: "Start an emergency fund", category: "Saving", intro: "A cash buffer keeps surprises from becoming debt.", body: "A common starting goal is three to six months of essential expenses. Begin with a smaller milestone if needed. Keep it accessible and separate from money for daily purchases.", action: "Create a goal", tool: "grow" },
  { title: "Pay yourself first", category: "Saving", intro: "Move savings before the month disappears.", body: "Choose a manageable amount to transfer after payday. Automating the transfer can help. If your income is uneven, set a minimum you can meet and top it up in better months.", action: "Create a goal", tool: "grow" },
  { title: "Build a flexible budget", category: "Budgeting", intro: "A budget is a plan, not a punishment.", body: "Start with essential bills, savings and flexible spending. The 50/30/20 split is a guideline, not a rule for every income or city. Adjust categories to reflect your actual costs.", action: "Set category limits", tool: "spend" },
  { title: "Find recurring money leaks", category: "Budgeting", intro: "Subscriptions are easy to forget.", body: "List recurring payments, their renewal dates and how often you use them. Cancel what no longer helps. Annual plans can cost less per month but still require cash up front.", action: "Review bills", tool: "spend" },
  { title: "SIP basics in two minutes", category: "Investing", intro: "A SIP is a way to invest regularly, not a return guarantee.", body: "A systematic investment plan invests a chosen amount at regular intervals, often in a mutual fund. Market values can rise or fall. Match the fund's risk and time horizon to your goal, and read costs before investing.", action: "Try the calculator", tool: "grow" },
  { title: "FD or equity?", category: "Investing", intro: "Match the tool to the time horizon.", body: "A fixed deposit generally has a stated interest rate and may suit shorter, lower-risk goals. Equity can be volatile and is usually considered for longer horizons. Taxes, inflation and fees affect what you keep.", action: "Compare growth", tool: "grow" },
  { title: "Protect your account", category: "Protecting", intro: "Pause before you approve a payment request.", body: "A UPI PIN authorises money leaving your account; receiving money does not require it. Verify payee details, avoid unknown links, and never share OTPs or PINs. Contact your bank promptly if something looks wrong.", action: "Review your plan", tool: "decide" },
  { title: "Build credit carefully", category: "Protecting", intro: "Borrowing creates obligations, not extra income.", body: "Pay dues on time and understand interest, fees and limits before using credit. A credit score reflects aspects of your borrowing history, but no score alone tells you whether a purchase is affordable.", action: "Check an EMI", tool: "decide" },
];

const rules = [
  { name: "50 / 30 / 20", value: "50% needs · 30% wants · 20% goals", detail: "A starting split for take-home income. High rent or irregular income may need a different plan.", width: "50%" },
  { name: "Pay yourself first", value: "Save before flexible spending", detail: "Choose an amount you can repeat, then automate it when practical.", width: "68%" },
  { name: "Emergency fund", value: "Aim for 3–6 months of essentials", detail: "Build in stages and keep the money accessible for real emergencies.", width: "75%" },
  { name: "Rule of 72", value: "72 ÷ annual % ≈ years to double", detail: "A rough estimate for a constant positive return. It ignores taxes, fees and changing rates.", width: "55%" },
];

const jargon = [
  { term: "Inflation", definition: "A general rise in prices over time, reducing what the same ₹ can buy." },
  { term: "Compound interest", definition: "Earnings added to a balance can themselves earn more over time." },
  { term: "SIP", definition: "Systematic Investment Plan: investing a set amount at regular intervals." },
  { term: "EMI", definition: "Equated Monthly Instalment: a scheduled loan payment that includes principal and interest." },
  { term: "Credit score", definition: "A number based on credit history that lenders may use when assessing borrowing." },
  { term: "Diversification", definition: "Spreading investments across assets to reduce reliance on one outcome." },
  { term: "Liquidity", definition: "How readily you can access money without a major delay or loss in value." },
  { term: "Expense ratio", definition: "A fund's annual operating cost, usually shown as a percentage of assets." },
];

const myths = [
  { myth: "I need a big salary to start saving.", fact: "A repeatable small amount can build a habit. Start with what your essentials allow." },
  { myth: "A SIP guarantees a return.", fact: "A SIP is an investing method. The underlying investment can gain or lose value." },
  { myth: "No-cost EMI always costs nothing.", fact: "Check processing fees, lost discounts, taxes and the total payable before deciding." },
];

const roadmap = ["Know your take-home income", "Track one month of spending", "Set a workable budget", "Build an emergency buffer", "Learn risk before investing", "Review and adjust regularly"];

export default function Section2Explore() {
  const { state } = useMoney();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [open, setOpen] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const filtered = useMemo(() => lessons.filter((lesson) => (category === "All" || lesson.category === category) && `${lesson.title} ${lesson.intro} ${lesson.body}`.toLowerCase().includes(query.trim().toLowerCase())), [query, category]);
  const toggle = (list: string[], key: string) => list.includes(key) ? list.filter((item) => item !== key) : [...list, key];
  return <section id="explore" className="relative bg-[#070B14] px-4 py-24 sm:px-8 sm:py-32">
    <div className="mx-auto max-w-7xl">
      <SectionHeading eyebrow="01 / Explore" title="The money stuff nobody explained." description="Useful ideas in plain language. Read a quick lesson, then try the matching tool with your own numbers." />
      
      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm backdrop-blur-md">
        <BadgeCheck size={22} className="text-emerald-400" />
        <strong className="font-heading text-white">Your progress: Level {levelFromXp(state.xp)} · {state.xp} XP</strong>
        <span className="text-slate-300">{state.badges.length ? `Badges: ${state.badges.join(" · ")}` : "Add an expense or goal to earn your first badge."}</span>
      </div>

      <div className="mt-12 rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-2xl font-bold text-white">Two-minute lessons</h3>
            <p className="mt-1 text-sm text-slate-400">Search a question or choose a topic.</p>
          </div>
          <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-emerald-500/50">
            <Search size={18} className="text-slate-400" />
            <span className="sr-only">Search lessons</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try UPI, SIP, EMI…" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500 sm:w-60" />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2" aria-label="Lesson categories">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                category === item
                  ? "border-emerald-500/40 bg-emerald-500 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.3)] font-bold"
                  : "border-white/10 bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">{filtered.length} lessons</p>
        
        {filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-slate-950/60 border border-white/5 p-8 text-center text-slate-400">
            No lessons match yet. Try another word or category.
          </div>
        ) : (
          <div className="mt-4 grid items-start gap-3 md:grid-cols-2">
            {filtered.map((lesson) => (
              <article key={lesson.title} className="rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-md transition-all hover:border-emerald-500/40 hover:bg-slate-950/80">
                <button
                  type="button"
                  aria-expanded={open === lesson.title}
                  onClick={() => setOpen(open === lesson.title ? null : lesson.title)}
                  className="flex w-full items-start justify-between gap-4 rounded-2xl p-5 text-left focus-visible:outline-2 focus-visible:outline-emerald-400"
                >
                  <span>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">{lesson.category} · 2 min</span>
                    <span className="mt-2 block font-heading text-lg font-bold text-white">{lesson.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-300">{lesson.intro}</span>
                  </span>
                  <ChevronDown size={18} className={`mt-1 shrink-0 text-slate-400 transition-transform ${open === lesson.title ? "rotate-180 text-emerald-400" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open === lesson.title && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-white/10 px-5 pb-5 pt-4">
                        <p className="text-sm leading-7 text-slate-300">{lesson.body}</p>
                        <button type="button" onClick={() => jumpTo(lesson.tool)} className="mt-4 inline-flex items-center gap-2 rounded-lg py-1 text-sm font-bold text-emerald-400 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-emerald-400">
                          {lesson.action} <ArrowRight size={15} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-24">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] text-emerald-400">
          <Lightbulb size={15} />
          Keep these in your pocket
        </div>
        <h3 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Four money rules. No magic.</h3>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {rules.map((rule, index) => (
            <motion.div key={rule.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <Card className="h-full flex flex-col justify-between">
                <div>
                  <p className="font-heading text-xl font-bold text-white">{rule.name}</p>
                  <p className="mt-3 text-sm font-semibold text-emerald-400">{rule.value}</p>
                  <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: rule.width }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-300">{rule.detail}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-24 grid gap-12 lg:grid-cols-2">
        <div>
          <h3 className="font-heading text-3xl font-extrabold text-white">Jargon buster</h3>
          <p className="mt-3 text-slate-400">Tap a term to flip from jargon to plain English.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {jargon.map((item) => {
              const active = flipped.includes(item.term);
              return (
                <motion.button
                  key={item.term}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFlipped((items) => toggle(items, item.term))}
                  aria-pressed={active}
                  className={`min-h-36 rounded-2xl border p-4 text-left transition-all backdrop-blur-md focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                    active
                      ? "border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : "border-white/10 bg-slate-900/70 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">{active ? "Plain English" : "Tap to reveal"}</span>
                  <span className={`mt-3 block ${active ? "text-sm leading-6 text-slate-200" : "font-heading text-lg font-bold text-white"}`}>
                    {active ? item.definition : item.term}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-heading text-3xl font-extrabold text-white">Myth or fact?</h3>
          <p className="mt-3 text-slate-400">Tap or swipe a card to reveal what holds up.</p>
          <div className="mt-6 space-y-3">
            {myths.map((item, index) => {
              const active = revealed.includes(index);
              return (
                <motion.button
                  key={item.myth}
                  type="button"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) > 45) setRevealed((items) => items.includes(index) ? items : [...items, index]);
                  }}
                  onClick={() => setRevealed((items) => active ? items.filter((i) => i !== index) : [...items, index])}
                  aria-pressed={active}
                  className={`block w-full rounded-2xl border p-6 text-left transition-all backdrop-blur-md focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                    active
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-white/10 bg-slate-900/70 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">{active ? "Fact" : "Myth · tap to reveal"}</span>
                  <span className={`mt-3 block font-heading text-lg font-bold ${active ? "text-slate-100" : "text-white"}`}>
                    {active ? item.fact : `“${item.myth}”`}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-24 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-7 text-white shadow-soft sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] text-emerald-400">
          <Sparkles size={16} />
          Beginner&apos;s roadmap
        </div>
        <h3 className="mt-4 max-w-xl font-heading text-3xl font-extrabold sm:text-4xl text-white">Build confidence one step at a time.</h3>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {roadmap.map((step, index) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-sm"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-sm font-extrabold text-slate-950 shadow-[0_0_12px_#10B981]">
                {index + 1}
              </span>
              <span className="pt-1 text-sm font-medium leading-6 text-slate-200">{step}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  </section>;
}
