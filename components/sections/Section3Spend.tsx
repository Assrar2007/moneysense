"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Download, Plus, Trash2, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMoney } from "@/context/MoneyContext";
import { createId } from "@/lib/id";
import { monthExpenses, monthlyIncome, percent, sharePercent, rupees, safeNumber, sumExpenses } from "@/lib/finance";
import { CATEGORIES, type Category } from "@/lib/types";
import { Button, Card, MoneyCounter, Progress, SectionHeading } from "@/components/ui";

const COLORS: Record<Category, string> = {
  Food: "#10B981",
  Transport: "#34D399",
  Housing: "#059669",
  Shopping: "#6EE7B7",
  Bills: "#047857",
  Health: "#A7F3D0",
  Other: "#0D9488"
};

const dateToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

function Charts({ categories, weekly }: { categories: { name: Category; value: number }[]; weekly: { name: string; amount: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { rootMargin: "150px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="mt-6 grid gap-4 lg:grid-cols-2">
    <Card>
      <h3 className="font-heading text-lg font-bold text-white">Where it went</h3>
      <div className="mt-3 h-64" role="img" aria-label={categories.map((item) => `${item.name}: ${rupees(item.value)}`).join(", ") || "No expenses yet"}>
        {visible && categories.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categories} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={3} stroke="rgba(0,0,0,0.5)">
                {categories.map((item) => <Cell key={item.name} fill={COLORS[item.name]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", color: "#F8FAFC" }}
                formatter={(value: number) => rupees(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-400">
            {categories.length ? "Chart loads when in view" : "Log an expense to see the breakdown"}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
        {categories.map((item) => (
          <span key={item.name} className="flex items-center gap-2 text-xs text-slate-300">
            <span className="size-2.5 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: COLORS[item.name], color: COLORS[item.name] }} />
            {item.name}
          </span>
        ))}
      </div>
    </Card>
    
    <Card>
      <h3 className="font-heading text-lg font-bold text-white">This month, by week</h3>
      <div className="mt-3 h-64" role="img" aria-label={weekly.map((item) => `${item.name}: ${rupees(item.amount)}`).join(", ") || "No expenses yet"}>
        {visible ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#1E293B" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8" }} />
              <YAxis tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} tick={{ fill: "#94A3B8" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", color: "#F8FAFC" }}
                formatter={(value: number) => rupees(value)}
              />
              <Bar dataKey="amount" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-400">Chart loads when in view</div>
        )}
      </div>
    </Card>
  </div>;
}

export default function Section3Spend() {
  const { state, ready, dispatch } = useMoney();
  const [salary, setSalary] = useState("");
  const [side, setSide] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDay, setBillDay] = useState("1");
  const [isEmi, setIsEmi] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (ready) { setSalary(String(state.salary)); setSide(String(state.sideIncome)); } }, [ready, state.salary, state.sideIncome]);
  useEffect(() => { setDate(dateToday()); }, []);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthly = useMemo(() => monthExpenses(state.expenses, currentYear, currentMonth), [state.expenses, currentYear, currentMonth]);
  const income = monthlyIncome(state.salary, state.sideIncome);
  const spent = sumExpenses(monthly);
  const remaining = Math.max(0, income - spent);
  const byCategory = CATEGORIES.map((name) => ({ name, value: sumExpenses(monthly.filter((item) => item.category === name)) })).filter((item) => item.value > 0);
  const weekly = [1, 2, 3, 4, 5].map((week) => ({ name: `W${week}`, amount: sumExpenses(monthly.filter((item) => Math.min(5, Math.ceil(Number(item.date.slice(8, 10)) / 7)) === week)) }));
  const food = byCategory.find((item) => item.name === "Food")?.value ?? 0;
  const recurring = monthly.filter((item) => item.recurring);
  const insight = spent === 0 ? "Your first logged expense will reveal a pattern here." : `Food is ${Math.round(sharePercent(food, spent))}% of this month's logged spending. ${food > state.budgets.Food && state.budgets.Food > 0 ? "It is above your Food budget." : "Compare it with your Food budget to decide if it fits."}`;
  const needs = sumExpenses(monthly.filter((item) => ["Food", "Transport", "Housing", "Bills", "Health"].includes(item.category)));
  const wants = sumExpenses(monthly.filter((item) => ["Shopping", "Other"].includes(item.category)));

  const addExpense = (event: React.FormEvent) => {
    event.preventDefault();
    const value = safeNumber(amount);
    if (value <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(new Date(`${date}T12:00:00`).getTime())) { setError("Enter an amount above ₹0 and a valid date."); return; }
    dispatch({ type: "expense/add", expense: { id: createId(), amount: value, category, date, note: note.trim().slice(0, 80) || category } });
    setAmount(""); setNote(""); setError("");
  };

  const addBill = (event: React.FormEvent) => {
    event.preventDefault();
    if (!billName.trim() || safeNumber(billAmount) <= 0) return;
    dispatch({ type: "bill/add", bill: { id: createId(), name: billName.trim().slice(0, 60), amount: safeNumber(billAmount), dueDay: Math.min(31, Math.max(1, Math.floor(safeNumber(billDay)))), isEmi } });
    setBillName(""); setBillAmount(""); setIsEmi(false);
  };

  const exportCsv = () => {
    const rows = ["Date,Category,Amount,Note,Recurring", ...state.expenses.map((item) => [item.date, item.category, item.amount, item.note, item.recurring ? "Yes" : "No"].map(csvCell).join(","))];
    const url = URL.createObjectURL(new Blob(["\uFEFF", rows.join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "moneysense-expenses.csv"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section id="spend" className="relative bg-[#070B14] px-4 py-24 sm:px-8 sm:py-32">
    <div className="mx-auto max-w-7xl">
      <SectionHeading eyebrow="02 / Spend" title="Every rupee has somewhere to go." description="Give your income a plan, log what leaves, and notice patterns before they surprise you." />

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-white/10">
          <p className="text-sm font-medium text-slate-400">Monthly income</p>
          <p className="mt-3 font-heading text-3xl font-extrabold text-white">
            <MoneyCounter value={income} ready={ready} />
          </p>
        </Card>
        
        <Card className="border-white/10">
          <p className="text-sm font-medium text-slate-400">Logged this month</p>
          <p className="mt-3 font-heading text-3xl font-extrabold text-slate-200">
            <MoneyCounter value={spent} ready={ready} />
          </p>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.15)]">
          <p className="text-sm font-medium text-emerald-400">After logged spending</p>
          <p className="mt-3 font-heading text-3xl font-extrabold text-emerald-400">
            <MoneyCounter value={remaining} ready={ready} />
          </p>
          <p className="mt-2 text-xs text-emerald-300/80">Unlogged costs are not included.</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
        <Card>
          <h3 className="font-heading text-xl font-bold text-white">Set your income</h3>
          <p className="mt-1 text-sm text-slate-400">Use monthly take-home amounts.</p>
          <form onSubmit={(event) => { event.preventDefault(); dispatch({ type: "income", salary: safeNumber(salary), sideIncome: safeNumber(side) }); }} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-300">
              Salary (₹)
              <input type="number" min="0" max="1000000000" step="1" value={salary} onChange={(event) => setSalary(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500/50" />
            </label>
            <label className="block text-sm font-semibold text-slate-300">
              Side income (₹)
              <input type="number" min="0" max="1000000000" step="1" value={side} onChange={(event) => setSide(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500/50" />
            </label>
            <Button type="submit">Save income</Button>
          </form>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Expense log</h3>
              <p className="mt-1 text-sm text-slate-400">A few honest entries beat a perfect spreadsheet.</p>
            </div>
            <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 hover:bg-emerald-500/10 focus-visible:outline-2 focus-visible:outline-emerald-400">
              <Download size={16} /> Export CSV
            </button>
          </div>

          <form onSubmit={addExpense} className="mt-6 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-300">
              Amount (₹)
              <input required type="number" min="0.01" max="1000000000" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="e.g. 250" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <label className="text-sm font-semibold text-slate-300">
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value as Category)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400">
                {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-300">
              Date
              <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <label className="text-sm font-semibold text-slate-300">
              Note
              <input value={note} maxLength={80} onChange={(event) => setNote(event.target.value)} placeholder="UPI coffee, groceries…" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-500" />
            </label>
            <div className="sm:col-span-2 flex items-center gap-4">
              <Button type="submit"><Plus size={17} /> Add expense</Button>
              {error && <span role="alert" className="text-sm font-semibold text-rose-400">{error}</span>}
            </div>
          </form>

          <div className="mt-7 max-h-72 space-y-2 overflow-y-auto pr-1">
            {state.expenses.length === 0 ? (
              <p className="rounded-xl bg-slate-950/60 border border-white/5 p-5 text-sm text-slate-400">No expenses yet. Add your first one above.</p>
            ) : (
              state.expenses.slice(0, 12).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/70 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{item.note}</span>
                    <span className="text-xs text-slate-400">{item.category} · {item.date}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <strong className="text-sm text-emerald-400 font-bold">{rupees(item.amount)}</strong>
                    <button type="button" onClick={() => dispatch({ type: "expense/delete", id: item.id })} aria-label={`Delete ${item.note} expense`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 focus-visible:outline-2 focus-visible:outline-rose-500">
                      <Trash2 size={16} />
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <h3 className="font-heading text-xl font-bold text-white">Category budgets</h3>
          <p className="mt-1 text-sm text-slate-400">Limits are monthly. Red alert indicates you have passed yours.</p>
          <div className="mt-6 space-y-5">
            {CATEGORIES.map((name) => {
              const used = byCategory.find((item) => item.name === name)?.value ?? 0;
              const limit = state.budgets[name];
              const over = limit > 0 && used > limit;
              return (
                <div key={name}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[name] }} />
                      {name}
                      {over && <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-bold"><AlertTriangle size={13} /> Over budget</span>}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-slate-400">
                      {rupees(used)} / ₹
                      <input aria-label={`${name} monthly budget in rupees`} type="number" min="0" max="1000000000" step="1" value={limit} onChange={(event) => dispatch({ type: "budget", category: name, amount: safeNumber(event.target.value) })} className="w-20 rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-right text-emerald-400 font-semibold outline-none focus:ring-1 focus:ring-emerald-400" />
                    </span>
                  </div>
                  <Progress value={percent(used, limit)} label={`${name} budget used`} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-emerald-500/25 bg-emerald-500/10">
          <Wallet size={27} className="text-emerald-400" />
          <h3 className="mt-5 font-heading text-xl font-bold text-white">A useful pattern</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{insight}</p>
          <div className="mt-7 border-t border-emerald-500/20 pt-5">
            <h4 className="font-heading text-lg font-bold text-white">50 / 30 / 20 check</h4>
            <p className="mt-2 text-xs leading-5 text-slate-300">Guideline for needs / wants / goals. Unlogged spending makes remaining share look larger.</p>
            <div className="mt-5 space-y-3">
              {[
                { name: "Needs", value: needs, target: 50 },
                { name: "Wants", value: wants, target: 30 },
                { name: "Unspent / potential goals", value: remaining, target: 20 },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm text-slate-200">
                    <span>{item.name}</span>
                    <strong className="text-white">{Math.round(sharePercent(item.value, income))}% <span className="font-normal text-slate-400">/ {item.target}% guide</span></strong>
                  </div>
                  <div className="mt-1.5">
                    <Progress value={percent(item.value, income)} label={`${item.name} share of income`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Charts categories={byCategory} weekly={weekly} />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-heading text-xl font-bold text-white">Recurring money leaks</h3>
          <p className="mt-2 text-sm text-slate-400">Review repeat payments and decide whether each still earns its place.</p>
          <div className="mt-5 space-y-2">
            {recurring.length === 0 && state.bills.length === 0 ? (
              <p className="rounded-xl bg-slate-950/60 border border-white/5 p-5 text-sm text-slate-400">No recurring payments recorded yet.</p>
            ) : (
              <>
                <p className="text-sm font-bold text-emerald-400">{recurring.length + state.bills.length} recurring entries to review</p>
                {[...recurring.map((item) => ({ id: item.id, name: item.note, amount: item.amount })), ...state.bills.map((item) => ({ id: item.id, name: item.name, amount: item.amount }))].map((item) => (
                  <div key={item.id} className="flex justify-between rounded-xl border border-white/5 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                    <span>{item.name}</span>
                    <strong className="text-emerald-400">{rupees(item.amount)}</strong>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-heading text-xl font-bold text-white">Bills & EMIs</h3>
          <form onSubmit={addBill} className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-semibold text-slate-300">
              Name
              <input required maxLength={60} value={billName} onChange={(event) => setBillName(event.target.value)} placeholder="Phone plan" className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <label className="text-xs font-semibold text-slate-300">
              Monthly ₹
              <input required type="number" min="0.01" max="1000000000" step="0.01" value={billAmount} onChange={(event) => setBillAmount(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <label className="text-xs font-semibold text-slate-300">
              Due day
              <input type="number" min="1" max="31" value={billDay} onChange={(event) => setBillDay(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
              <input type="checkbox" checked={isEmi} onChange={(event) => setIsEmi(event.target.checked)} className="accent-emerald-500" />
              This is an EMI
            </label>
            <Button type="submit" className="sm:justify-self-end"><Plus size={16} /> Add bill</Button>
          </form>
          <div className="mt-5 space-y-2">
            {state.bills.length === 0 ? (
              <p className="rounded-xl bg-slate-950/60 border border-white/5 p-5 text-sm text-slate-400">No bills yet. Add a recurring bill or EMI above.</p>
            ) : (
              state.bills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                  <span>
                    <strong className="text-white">{bill.name}</strong>
                    <span className="block text-xs text-slate-400">Day {bill.dueDay}{bill.isEmi ? " · EMI" : ""}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <strong className="text-emerald-400">{rupees(bill.amount)}</strong>
                    <button type="button" onClick={() => dispatch({ type: "bill/delete", id: bill.id })} aria-label={`Delete ${bill.name} bill`} className="rounded p-1.5 text-slate-400 hover:text-rose-400 focus-visible:outline-2 focus-visible:outline-rose-500">
                      <Trash2 size={15} />
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  </section>;
}
