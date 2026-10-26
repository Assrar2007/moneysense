"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Plus, Sprout, Target } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMoney } from "@/context/MoneyContext";
import { createId } from "@/lib/id";
import { futureValue, monthExpenses, monthlyNeeded, percent, rupees, safeNumber, sumExpenses } from "@/lib/finance";
import { Button, Card, Progress, SectionHeading } from "@/components/ui";

import { ModelViewer } from "@/components/ModelViewer";

const dateToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const rate = (value: string) => Math.min(0.3, safeNumber(value, 30) / 100);

function GrowthChart({ data }: { data: { year: number; Savings: number; FD: number; Equity: number; "Inflation hurdle": number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { rootMargin: "150px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="mt-6 h-80" role="img" aria-label="Illustrative growth chart comparing savings account, fixed deposit, equity and an inflation hurdle">
    {visible ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#1E293B" strokeDasharray="3 3" />
          <XAxis dataKey="year" tickFormatter={(value: number) => `${value}y`} tickLine={false} axisLine={false} tick={{ fill: "#94A3B8" }} />
          <YAxis tickFormatter={(value: number) => `₹${Math.round(value / 100000)}L`} tickLine={false} axisLine={false} width={45} tick={{ fill: "#94A3B8" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", color: "#F8FAFC" }}
            formatter={(value: number) => rupees(value)}
            labelFormatter={(year) => `Year ${year}`}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ color: "#CBD5E1" }} />
          <Line type="monotone" dataKey="Savings" stroke="#64748B" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="FD" stroke="#0D9488" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Equity" stroke="#10B981" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="Inflation hurdle" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="grid h-full place-items-center text-sm text-slate-400">Chart loads when in view</div>
    )}
  </div>;
}

export default function Section4Grow() {
  const { state, dispatch } = useMoney();
  const [goalName, setGoalName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [contributions, setContributions] = useState<Record<string, string>>({});
  const [emergency, setEmergency] = useState("");
  const [monthly, setMonthly] = useState("3000");
  const [lump, setLump] = useState("10000");
  const [years, setYears] = useState(20);
  const [savingsRate, setSavingsRate] = useState("3");
  const [fdRate, setFdRate] = useState("6.5");
  const [equityRate, setEquityRate] = useState("10");
  const [inflationRate, setInflationRate] = useState("5");
  const [futureYears, setFutureYears] = useState(10);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [today, setToday] = useState("");
  useEffect(() => { setToday(dateToday()); }, []);
  useEffect(() => { setEmergency(String(state.emergencySavings)); }, [state.emergencySavings]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const expenses = useMemo(() => monthExpenses(state.expenses, currentYear, currentMonth), [state.expenses, currentYear, currentMonth]);
  const expenseTotal = sumExpenses(expenses);
  const contribution = safeNumber(monthly);
  const principal = safeNumber(lump);
  const savings = rate(savingsRate), fd = rate(fdRate), equity = rate(equityRate), inflation = rate(inflationRate);
  const data = useMemo(() => Array.from({ length: years + 1 }, (_, year) => {
    const paid = principal + contribution * year * 12;
    return { year, Savings: futureValue(contribution, principal, savings, year), FD: futureValue(contribution, principal, fd, year), Equity: futureValue(contribution, principal, equity, year), "Inflation hurdle": paid * Math.pow(1 + inflation, year) };
  }), [years, contribution, principal, savings, fd, equity, inflation]);
  const full = futureValue(contribution, principal, equity, years);
  const delayed = futureValue(contribution, principal, equity, Math.max(0, years - 5));
  const future = futureValue(contribution, principal, equity, futureYears);
  const profile = answers.length === 3 ? Math.round(answers.reduce((sum, item) => sum + item, 0) / 3) : 0;
  const allocation = profile <= 1 ? { equity: 20, fd: 60, cash: 20, label: "Cautious" } : profile < 2 ? { equity: 50, fd: 35, cash: 15, label: "Balanced" } : { equity: 75, fd: 20, cash: 5, label: "Growth-oriented" };
  const questions = [
    { title: "When might you need this money?", choices: ["Within 2 years", "In 3–5 years", "In 6+ years"] },
    { title: "If its value fell 20%, you would…", choices: ["Need to withdraw", "Pause and review", "Stay invested if the plan fits"] },
    { title: "How much of it must stay accessible?", choices: ["Most of it", "Some of it", "Very little"] },
  ];
  const createGoal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!goalName.trim() || safeNumber(target) <= 0 || !deadline || deadline < dateToday()) return;
    dispatch({ type: "goal/add", goal: { id: createId(), name: goalName.trim().slice(0, 60), target: safeNumber(target), saved: 0, deadline } });
    setGoalName(""); setTarget(""); setDeadline("");
  };

  return <section id="grow" className="relative bg-[#070B14] px-4 py-24 sm:px-8 sm:py-32">
    <div className="mx-auto max-w-7xl">
      <SectionHeading eyebrow="03 / Grow" title="Future you starts with today." description="Set a goal, build a buffer and see how time changes an investing illustration. You control the assumptions." />

      {/* Interactive 3D Model Viewer Showcase */}
      <div className="mt-12">
        <ModelViewer />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <div className="flex items-center gap-3">
            <Target className="text-emerald-400" />
            <h3 className="font-heading text-xl font-bold text-white">Savings goals</h3>
          </div>
          
          <form onSubmit={createGoal} className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-semibold text-slate-300">
              Goal name
              <input required maxLength={60} value={goalName} onChange={(event) => setGoalName(event.target.value)} placeholder="Trip home" className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <label className="text-xs font-semibold text-slate-300">
              Target (₹)
              <input required type="number" min="1" max="1000000000" step="1" value={target} onChange={(event) => setTarget(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <label className="text-xs font-semibold text-slate-300">
              Deadline
              <input required type="date" min={today} value={deadline} onChange={(event) => setDeadline(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <Button type="submit" className="sm:col-span-3 sm:justify-self-start">
              <Plus size={16} /> Create goal
            </Button>
          </form>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {state.goals.length === 0 ? (
              <p className="rounded-2xl border border-white/5 bg-slate-950/60 p-6 text-sm text-slate-400 sm:col-span-2">No goals yet. Start with one amount and a date.</p>
            ) : (
              state.goals.map((goal) => {
                const share = percent(goal.saved, goal.target);
                return (
                  <div key={goal.id} className="rounded-2xl border border-white/5 bg-slate-950/70 p-5">
                    <div className="flex items-center gap-4">
                      <div role="img" aria-label={`${goal.name} ${Math.round(share)}% saved`} className="grid size-20 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#10B981 ${share}%, #1E293B ${share}%)` }}>
                        <div className="grid size-16 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
                          {Math.round(share)}%
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate font-heading font-bold text-white">{goal.name}</h4>
                        <p className="mt-1 text-sm text-slate-300">{rupees(goal.saved)} / {rupees(goal.target)}</p>
                        <p className="mt-1 text-xs text-emerald-400">{rupees(monthlyNeeded(goal.target, goal.saved, goal.deadline))} / month needed</p>
                      </div>
                    </div>
                    <form onSubmit={(event) => {
                      event.preventDefault();
                      const value = safeNumber(contributions[goal.id]);
                      if (value > 0) {
                        dispatch({ type: "goal/contribute", id: goal.id, amount: value });
                        setContributions((values) => ({ ...values, [goal.id]: "" }));
                      }
                    }} className="mt-4 flex gap-2">
                      <label className="sr-only" htmlFor={`contribute-${goal.id}`}>Contribution to {goal.name} in rupees</label>
                      <input id={`contribute-${goal.id}`} type="number" min="1" max="1000000000" step="1" value={contributions[goal.id] ?? ""} onChange={(event) => setContributions((values) => ({ ...values, [goal.id]: event.target.value }))} placeholder="Add ₹" className="min-w-0 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-emerald-400" />
                      <button type="submit" aria-label={`Add contribution to ${goal.name}`} className="rounded-xl bg-emerald-500 px-3 text-slate-950 font-bold hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-400">
                        <Plus size={17} />
                      </button>
                    </form>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="border-emerald-500/25 bg-emerald-500/10">
          <Sprout size={28} className="text-emerald-400" />
          <h3 className="mt-5 font-heading text-xl font-bold text-white">Emergency fund</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">A common guide is 3–6 months of expenses. Use your Spend data as a starting estimate.</p>
          {expenseTotal > 0 ? (
            <>
              <p className="mt-7 font-heading text-3xl font-extrabold text-white">{rupees(state.emergencySavings)}</p>
              <p className="mt-1 text-sm text-slate-300">{(state.emergencySavings / expenseTotal).toFixed(1)} months at this month&apos;s logged spending</p>
              <div className="mt-5">
                <Progress value={percent(state.emergencySavings, expenseTotal * 6)} label="Emergency fund progress toward six months" />
              </div>
              <div className="mt-4 flex justify-between text-xs font-semibold text-emerald-400">
                <span>3 months: {rupees(expenseTotal * 3)}</span>
                <span>6 months: {rupees(expenseTotal * 6)}</span>
              </div>
            </>
          ) : (
            <p className="mt-8 rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300">Log expenses in Spend to calculate your 3–6 month range.</p>
          )}
          <form onSubmit={(event) => { event.preventDefault(); dispatch({ type: "emergency", amount: safeNumber(emergency) }); }} className="mt-8">
            <label className="text-sm font-semibold text-slate-300">
              Amount already saved (₹)
              <input type="number" min="0" max="1000000000" step="1" value={emergency} onChange={(event) => setEmergency(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <Button type="submit" className="mt-3">Update fund</Button>
          </form>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="p-6 sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">What if?</p>
              <h3 className="mt-2 font-heading text-2xl font-bold text-white">The growth lab</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Monthly contributions are made at month-end. The orange line shows how the same contributed amount would need to grow to keep up with the assumed inflation rate. Taxes and fees are excluded.</p>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300">Illustrative, not guaranteed</span>
          </div>
          
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold text-slate-300">
              Monthly SIP / deposit (₹)
              <input type="number" min="0" max="1000000000" step="100" value={monthly} onChange={(event) => setMonthly(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <label className="text-sm font-semibold text-slate-300">
              Starting amount (₹)
              <input type="number" min="0" max="1000000000" step="100" value={lump} onChange={(event) => setLump(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <label className="text-sm font-semibold text-slate-300">
              Years: {years}
              <input aria-label="Investment years" type="range" min="5" max="30" value={years} onChange={(event) => setYears(Number(event.target.value))} className="mt-6 w-full accent-emerald-500" />
            </label>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Savings %", value: savingsRate, set: setSavingsRate },
              { label: "FD %", value: fdRate, set: setFdRate },
              { label: "Equity %", value: equityRate, set: setEquityRate },
              { label: "Inflation %", value: inflationRate, set: setInflationRate },
            ].map((item) => (
              <label key={item.label} className="text-xs font-semibold text-slate-400">
                {item.label} / year
                <input type="number" min="0" max="30" step="0.1" value={item.value} onChange={(event) => item.set(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-emerald-400 font-semibold outline-none focus:ring-1 focus:ring-emerald-400" />
              </label>
            ))}
          </div>

          <GrowthChart data={data} />

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-5">
              <p className="text-xs text-slate-400">You put in</p>
              <strong className="mt-2 block font-heading text-xl text-white">{rupees(principal + contribution * years * 12)}</strong>
            </div>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
              <p className="text-xs text-emerald-400">Illustrative equity value</p>
              <strong className="mt-2 block font-heading text-xl text-emerald-300">{rupees(full)}</strong>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-5">
              <p className="text-xs text-slate-400">That equity value in today&apos;s ₹</p>
              <strong className="mt-2 block font-heading text-xl text-white">{rupees(full / Math.pow(1 + inflation, years))}</strong>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Cost of waiting</p>
          <h3 className="mt-2 font-heading text-2xl font-bold text-white">Five years makes a difference.</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">Same monthly amount and starting amount, with contributions and investing delayed by five years. No return during the wait is assumed.</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
              <p className="text-xs text-emerald-400">Start now</p>
              <p className="mt-2 font-heading text-xl font-bold text-white">{rupees(full)}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-5">
              <p className="text-xs text-slate-400">Start in 5 years</p>
              <p className="mt-2 font-heading text-xl font-bold text-slate-300">{rupees(delayed)}</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-bold text-emerald-400">Illustrative difference: {rupees(Math.max(0, full - delayed))}</p>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 text-white border-white/10">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border-[35px] border-emerald-500/10" />
          <p className="relative text-xs font-bold uppercase tracking-widest text-emerald-400">Future you</p>
          <h3 className="relative mt-2 font-heading text-2xl font-bold text-white">What could consistency look like?</h3>
          <div className="relative mt-6 flex gap-2">
            {[5, 10, 20].map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setFutureYears(year)}
                aria-pressed={futureYears === year}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                  futureYears === year
                    ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_#10B981]"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {year} years
              </button>
            ))}
          </div>
          <motion.div key={futureYears} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative mt-8 font-heading text-4xl font-extrabold text-emerald-400 sm:text-5xl">
            {rupees(future)}
          </motion.div>
          <p className="relative mt-3 text-sm text-slate-400">At your illustrative equity rate. Actual returns can be lower or negative.</p>
        </Card>
      </div>

      <Card className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Three quick questions</p>
        <h3 className="mt-2 font-heading text-2xl font-bold text-white">How much risk feels workable?</h3>
        <p className="mt-2 text-sm text-slate-300">This is an educational example, not a recommendation. Keep near-term money accessible.</p>
        
        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {questions.map((question, index) => (
            <fieldset key={question.title} className="rounded-2xl border border-white/5 bg-slate-950/70 p-5">
              <legend className="font-heading text-sm font-bold text-white">{index + 1}. {question.title}</legend>
              <div className="mt-4 space-y-2">
                {question.choices.map((choice, choiceIndex) => (
                  <label key={choice} className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-300 hover:text-white">
                    <input type="radio" name={`risk-${index}`} checked={answers[index] === choiceIndex} onChange={() => { setAnswers((current) => { const next = [...current]; next[index] = choiceIndex; return next; }); setQuizDone(false); }} className="mt-1 accent-emerald-500" />
                    {choice}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <Button className="mt-6" disabled={!questions.every((_, index) => Number.isInteger(answers[index]))} onClick={() => { setQuizDone(true); dispatch({ type: "quiz/finish" }); }}>
          See an example allocation <ArrowRight size={16} />
        </Button>

        {quizDone && (
          <div className="mt-7 flex flex-col items-center gap-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 sm:flex-row">
            <div className="grid size-40 shrink-0 place-items-center rounded-full" role="img" aria-label={`Illustrative allocation: ${allocation.equity}% equity, ${allocation.fd}% FD, ${allocation.cash}% cash`} style={{ background: `conic-gradient(#10B981 0 ${allocation.equity}%, #0F766E ${allocation.equity}% ${allocation.equity + allocation.fd}%, #334155 ${allocation.equity + allocation.fd}% 100%)` }}>
              <div className="grid size-28 place-items-center rounded-full bg-slate-950 text-center text-sm font-bold text-emerald-400">
                {allocation.label}
              </div>
            </div>
            <div>
              <h4 className="font-heading text-xl font-bold text-white">One illustrative mix</h4>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                <span className="font-semibold text-emerald-400">{allocation.equity}%</span> diversified equity · <span className="font-semibold text-teal-400">{allocation.fd}%</span> FD / lower-risk assets · <span className="font-semibold text-slate-400">{allocation.cash}%</span> accessible cash. A real allocation depends on your goals, debt, time horizon and ability to absorb losses.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  </section>;
}
