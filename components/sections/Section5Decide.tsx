"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Clipboard, Printer, ShieldCheck, Sparkles } from "lucide-react";
import { Button, Card, SectionHeading } from "@/components/ui";
import { useMoney } from "@/context/MoneyContext";
import { createId } from "@/lib/id";
import { emi, futureValue, monthExpenses, monthlyIncome, sharePercent, rupees, safeNumber, sumExpenses } from "@/lib/finance";
import { moneyHealth } from "@/lib/score";

type Kind = "purchase" | "loan" | "allocation";
const kinds: { id: Kind; label: string }[] = [{ id: "purchase", label: "Buy something" }, { id: "loan", label: "Take an EMI" }, { id: "allocation", label: "Save, invest or repay debt" }];
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

export default function Section5Decide() {
  const { state, dispatch } = useMoney();
  const [kind, setKind] = useState<Kind>("purchase");
  const [label, setLabel] = useState("A new laptop");
  const [amount, setAmount] = useState("45000");
  const [monthlySave, setMonthlySave] = useState("5000");
  const [downPayment, setDownPayment] = useState("10000");
  const [loanMonths, setLoanMonths] = useState("12");
  const [loanRate, setLoanRate] = useState("12");
  const [equityRate, setEquityRate] = useState("10");
  const [fdRate, setFdRate] = useState("6.5");
  const [debtRate, setDebtRate] = useState("18");
  const [burst, setBurst] = useState(0);
  const [copyState, setCopyState] = useState("");
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const expenses = useMemo(() => monthExpenses(state.expenses, currentYear, currentMonth), [state.expenses, currentYear, currentMonth]);
  const income = monthlyIncome(state.salary, state.sideIncome);
  const spent = sumExpenses(expenses);
  const price = safeNumber(amount);
  const saving = safeNumber(monthlySave);
  const rate = Math.min(0.3, safeNumber(equityRate, 30) / 100);
  const fixedRate = Math.min(0.3, safeNumber(fdRate, 30) / 100);
  const apr = Math.min(1, safeNumber(loanRate, 100) / 100);
  const debtApr = Math.min(1, safeNumber(debtRate, 100) / 100);
  const months = Math.min(120, Math.max(1, Math.floor(safeNumber(loanMonths, 120))));
  const down = Math.min(price, safeNumber(downPayment));
  const payment = emi(Math.max(0, price - down), apr, months);
  const monthsToSave = saving > 0 ? Math.ceil(price / saving) : null;
  const hours = income > 0 ? price / (income / 160) : null;
  const opportunity = Math.max(0, futureValue(0, price, rate, 5) - price);
  const outstandingEmis = state.bills.filter((bill) => bill.isEmi).reduce((sum, bill) => sum + safeNumber(bill.amount), 0);
  const health = moneyHealth(state);
  const steps = [
    income === 0 ? "Set your take-home income in Spend to compare affordability." : spent === 0 ? "Log a month of expenses to understand what is actually left." : spent > income * 0.8 ? "Review your largest expense category and free up some monthly room." : "Keep tracking your spending so the monthly picture stays accurate.",
    spent > 0 && state.emergencySavings < spent * 3 ? `Build your emergency fund toward ${rupees(spent * 3)} (three months at this month's logged spend).` : "Keep your emergency fund accessible and review its target as costs change.",
    state.goals.length === 0 ? "Create one dated savings goal in Grow." : outstandingEmis > income * 0.15 && income > 0 ? "Review existing EMI payments before taking on another." : "Review your goals and assumptions before making the next big commitment.",
  ];
  const options = kind === "allocation" ? [
    { title: "Repay debt", value: `${rupees(price * debtApr)} interest avoided in a year*`, detail: "If this amount reduces a balance charged at the entered APR for a full year. Check fees and actual loan terms." },
    { title: "Keep in FD", value: rupees(futureValue(0, price, fixedRate, 5)), detail: "Illustrative value after five years at the entered fixed rate, before taxes." },
    { title: "Invest instead", value: rupees(futureValue(0, price, rate, 5)), detail: "Illustrative value after five years. Equity returns are uncertain and can be negative." },
    { title: "Keep liquid", value: rupees(price), detail: "Cash stays accessible, but inflation may reduce its purchasing power." },
  ] : [
    { title: "Buy now", value: rupees(price), detail: income > 0 ? `${Math.round(sharePercent(price, income))}% of one month's income · ${hours?.toFixed(1)} hours of work at an estimated 160-hour month.` : "Add income to estimate work hours and income share." },
    { title: "Save then buy", value: monthsToSave === null ? "Set a saving amount" : `${monthsToSave} months`, detail: saving > 0 ? `At ${rupees(saving)} set aside each month, assuming the price stays the same.` : "Enter an amount you could set aside monthly." },
    { title: kind === "loan" ? "Use an EMI" : "Invest instead", value: kind === "loan" ? `${rupees(payment)} / month` : `+${rupees(opportunity)} potential`, detail: kind === "loan" ? `Total ${rupees(down + payment * months)} with ${rupees(down)} down over ${months} months, excluding fees. New EMI plus existing EMIs would be ${Math.round(sharePercent(payment + outstandingEmis, income))}% of income.` : `Illustrative growth on ${rupees(price)} over five years at ${Math.round(rate * 1000) / 10}% a year; not guaranteed.` },
    { title: "Skip for now", value: `${rupees(price)} stays available`, detail: "You keep flexibility for an emergency or a goal you value more." },
  ];
  const verdict = kind === "allocation"
    ? price === 0 ? "Enter an amount to compare the choices." : spent > 0 && state.emergencySavings < spent * 3 ? "Protect your buffer first. If you also have costly debt, compare its guaranteed interest cost before taking market risk." : debtApr > rate ? "The entered debt APR exceeds the illustrative equity return. Repaying that debt may be the stronger first comparison, after checking penalties." : "Match the choice to when you need the money. Near-term needs call for accessible, lower-risk funds; long-term investing carries market risk."
    : price === 0 ? "Enter a price to begin." : income === 0 ? "Set your income in Spend to judge affordability. You can still compare saving time and total cost here." : kind === "loan" && sharePercent(payment + outstandingEmis, income) > 15 ? "The new EMI would make your monthly commitments heavy relative to income. Compare saving first or a lower price." : spent > 0 && state.emergencySavings < spent * 3 && price > income * 0.3 ? "Your emergency buffer is below three months of logged spending. Saving first keeps more flexibility." : price > income * 0.5 ? "This is a large share of one month's income. A savings plan makes the trade-off easier to see." : "The price is a smaller share of monthly income. Check your upcoming bills and goals before deciding.";
  const summary = `${label.trim() || "Money decision"}: ${kind === "allocation" ? "allocate" : kind === "loan" ? "EMI" : "purchase"} ${rupees(price)}. ${verdict} Monthly income ${rupees(income)}, logged spending ${rupees(spent)}, emergency fund ${rupees(state.emergencySavings)}. Illustrative only.`;
  const lock = () => {
    if (price <= 0) return;
    dispatch({ type: "decision/lock", decision: { id: createId(), label: label.trim().slice(0, 80) || "Money decision", summary, date: localDate() } });
    setBurst((count) => count + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setBurst(0), 1400);
  };
  const latest = state.decisions[0];
  const copy = async () => {
    if (!latest) return;
    try { await navigator.clipboard.writeText(latest.summary); setCopyState("Copied!"); }
    catch { setCopyState("Copy unavailable here. Select the summary text below."); }
  };
  return <section id="decide" className="relative bg-[#070B14] px-4 py-24 sm:px-8 sm:py-32">
    <div className="mx-auto max-w-7xl">
      <SectionHeading eyebrow="04 / Decide" title="The decision is yours. Make it informed." description="Compare a purchase, an EMI or a money allocation using your income, logged spending, goals and emergency buffer." />

      <div className="mt-12 grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
        <Card>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Decision lab</p>
          <h3 className="mt-2 font-heading text-2xl font-bold text-white">What are you weighing?</h3>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Decision type">
            {kinds.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setKind(item.id)}
                aria-pressed={kind === item.id}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                  kind === item.id
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_#10B981]"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-300 sm:col-span-2">
              Name the decision
              <input value={label} maxLength={80} onChange={(event) => setLabel(event.target.value)} placeholder="A new laptop" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <label className="text-sm font-semibold text-slate-300">
              {kind === "allocation" ? "Amount to allocate" : "Price"} (₹)
              <input type="number" min="0" max="1000000000" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            {kind !== "allocation" && (
              <label className="text-sm font-semibold text-slate-300">
                Can save monthly (₹)
                <input type="number" min="0" max="1000000000" step="1" value={monthlySave} onChange={(event) => setMonthlySave(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
              </label>
            )}
            {kind === "loan" && (
              <>
                <label className="text-sm font-semibold text-slate-300">
                  Down payment (₹)
                  <input type="number" min="0" max="1000000000" step="1" value={downPayment} onChange={(event) => setDownPayment(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
                </label>
                <label className="text-sm font-semibold text-slate-300">
                  EMI months
                  <input type="number" min="1" max="120" step="1" value={loanMonths} onChange={(event) => setLoanMonths(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
                </label>
                <label className="text-sm font-semibold text-slate-300">
                  Loan APR %
                  <input type="number" min="0" max="100" step="0.1" value={loanRate} onChange={(event) => setLoanRate(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
                </label>
              </>
            )}
            {kind === "allocation" && (
              <>
                <label className="text-sm font-semibold text-slate-300">
                  Debt APR %
                  <input type="number" min="0" max="100" step="0.1" value={debtRate} onChange={(event) => setDebtRate(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
                </label>
                <label className="text-sm font-semibold text-slate-300">
                  FD rate %
                  <input type="number" min="0" max="30" step="0.1" value={fdRate} onChange={(event) => setFdRate(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
                </label>
              </>
            )}
            <label className="text-sm font-semibold text-slate-300">
              Equity assumption %
              <input type="number" min="0" max="30" step="0.1" value={equityRate} onChange={(event) => setEquityRate(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-400">Illustrative comparisons, not guaranteed returns or personal financial advice. Prices, fees and taxes can change the result.</p>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">The trade-offs</p>
              <h3 className="mt-2 font-heading text-2xl font-bold text-white">Four ways to look at it</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-slate-800/80 px-3.5 py-1.5 text-xs font-bold text-slate-300">Income {rupees(income)} / month</span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {options.map((option, index) => (
              <motion.div key={option.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">{option.title}</p>
                <p className="mt-3 font-heading text-xl font-bold text-white">{option.value}</p>
                <p className="mt-3 text-xs leading-5 text-slate-300">{option.detail}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-2 font-heading font-bold text-emerald-400">
              <ShieldCheck size={20} />
              A thoughtful read
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-200">{verdict}</p>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
        <Card>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Your money health</p>
          <div className="mt-5 flex items-center gap-6">
            <div className="grid size-32 shrink-0 place-items-center rounded-full" role="img" aria-label={`Money Health Score ${health} out of 100`} style={{ background: `conic-gradient(#10B981 ${health}%, #1E293B ${health}%)` }}>
              <div className="grid size-24 place-items-center rounded-full bg-slate-900 border border-white/5">
                <span className="font-heading text-3xl font-extrabold text-white">
                  {health}
                  <span className="block text-center text-xs font-normal text-slate-400">/ 100</span>
                </span>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-300">An educational snapshot from the data you entered, not a credit score. More complete inputs make it more useful.</p>
          </div>
          <h4 className="mt-7 font-heading font-bold text-white">Three next steps</h4>
          <ol className="mt-3 space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-slate-300">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400 border border-emerald-500/30">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 text-white">
          <Sparkles size={26} className="text-emerald-400" />
          <h3 className="mt-5 font-heading text-2xl font-bold text-white">Turn thinking into a plan.</h3>
          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300">Save a summary of your decision, copy it or print it. You can come back and make a different call later.</p>
          
          <Button disabled={price <= 0} className="relative mt-7" onClick={lock}>
            <Check size={17} /> Lock my decision
          </Button>

          {burst > 0 && (
            <div className="pointer-events-none absolute left-28 top-36" aria-hidden="true">
              {Array.from({ length: 24 }, (_, index) => {
                const angle = index * Math.PI * 2 / 24;
                return (
                  <motion.span
                    key={`${burst}-${index}`}
                    className="absolute size-2 rounded-sm bg-emerald-400 shadow-[0_0_8px_#10B981]"
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: Math.cos(angle) * (70 + index % 5 * 16), y: Math.sin(angle) * (70 + index % 4 * 18), opacity: 0, rotate: index * 39, scale: 0.3 }}
                    transition={{ duration: 1.15, ease: "easeOut" }}
                  />
                );
              })}
            </div>
          )}
          <p className="mt-5 text-xs text-slate-400">Your plan stays in this browser&apos;s local storage.</p>
        </Card>
      </div>

      {latest && (
        <Card id="money-plan" className="mt-6 border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">My Money Plan · {latest.date}</p>
              <h3 className="mt-2 font-heading text-2xl font-bold text-white">{latest.label}</h3>
            </div>
            <div className="flex gap-2 print:hidden">
              <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400">
                <Clipboard size={15} /> Copy summary
              </button>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400">
                <Printer size={15} /> Print / PDF
              </button>
            </div>
          </div>
          <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-200">{latest.summary}</p>
          {copyState && <p role="status" className="mt-3 text-xs font-semibold text-emerald-400 print:hidden">{copyState}</p>}
          {state.decisions.length > 1 && <p className="mt-4 text-xs text-slate-400 print:hidden">{state.decisions.length} decisions saved in this browser. Latest shown above.</p>}
        </Card>
      )}

      <p className="mt-9 text-center text-sm text-slate-500">*Debt interest avoided is a simplified one-year comparison; actual savings depend on balance, repayment timing and fees.</p>
    </div>
  </section>;
}
