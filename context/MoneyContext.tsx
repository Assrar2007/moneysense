"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { MotionConfig } from "framer-motion";
import { STORAGE_KEY } from "@/lib/config";
import { demoState, emptyState } from "@/lib/demo";
import { safeNumber } from "@/lib/finance";
import { CATEGORIES, type Bill, type Category, type Decision, type Expense, type Goal, type MoneyState } from "@/lib/types";

type Action =
  | { type: "load"; state: MoneyState }
  | { type: "demo" | "reset" }
  | { type: "income"; salary: number; sideIncome: number }
  | { type: "expense/add"; expense: Expense }
  | { type: "expense/delete"; id: string }
  | { type: "budget"; category: Category; amount: number }
  | { type: "bill/add"; bill: Bill }
  | { type: "bill/delete"; id: string }
  | { type: "goal/add"; goal: Goal }
  | { type: "goal/contribute"; id: string; amount: number }
  | { type: "emergency"; amount: number }
  | { type: "quiz/finish" }
  | { type: "decision/lock"; decision: Decision };

type Toast = { id: number; message: string };
type Store = { state: MoneyState; ready: boolean; dispatch: (action: Action) => void; toast: Toast | null; dismissToast: () => void };
const MoneyContext = createContext<Store | null>(null);

const award = (state: MoneyState, amount: number, badge?: string): MoneyState => ({
  ...state,
  xp: state.xp + amount,
  badges: badge && !state.badges.includes(badge) ? [...state.badges, badge] : state.badges,
});

function reducer(state: MoneyState, action: Action): MoneyState {
  switch (action.type) {
    case "load": return action.state;
    case "demo": return demoState();
    case "reset": return emptyState();
    case "income": return { ...state, salary: safeNumber(action.salary), sideIncome: safeNumber(action.sideIncome) };
    case "expense/add": return award({ ...state, expenses: [{ ...action.expense, amount: safeNumber(action.expense.amount) }, ...state.expenses] }, 10, "First expense");
    case "expense/delete": return { ...state, expenses: state.expenses.filter((item) => item.id !== action.id) };
    case "budget": return { ...state, budgets: { ...state.budgets, [action.category]: safeNumber(action.amount) } };
    case "bill/add": return { ...state, bills: [...state.bills, { ...action.bill, amount: safeNumber(action.bill.amount), dueDay: Math.min(31, Math.max(1, Math.floor(safeNumber(action.bill.dueDay)))) }] };
    case "bill/delete": return { ...state, bills: state.bills.filter((item) => item.id !== action.id) };
    case "goal/add": return award({ ...state, goals: [...state.goals, { ...action.goal, target: safeNumber(action.goal.target), saved: Math.min(safeNumber(action.goal.target), safeNumber(action.goal.saved)) }] }, 25, "Goal setter");
    case "goal/contribute": {
      const selected = state.goals.find((goal) => goal.id === action.id);
      if (!selected) return state;
      const nextSaved = Math.min(selected.target, selected.saved + safeNumber(action.amount));
      const credited = Math.max(0, nextSaved - selected.saved);
      return {
        ...state,
        goals: state.goals.map((goal) => goal.id === action.id ? { ...goal, saved: nextSaved } : goal),
        emergencySavings: selected.name.toLowerCase().includes("emergency") ? safeNumber(state.emergencySavings + credited) : state.emergencySavings,
      };
    }
    case "emergency": return { ...state, emergencySavings: safeNumber(action.amount) };
    case "quiz/finish": return state.quizCompleted ? state : award({ ...state, quizCompleted: true }, 30, "Know your risk");
    case "decision/lock": return award({ ...state, decisions: [action.decision, ...state.decisions] }, 40, "Thoughtful decision");
  }
}

// Ignore malformed or old local data and return a safe populated demo.
function readStored(): MoneyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return demoState();
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return demoState();
    const value = data as Partial<MoneyState>;
    if (!Array.isArray(value.expenses) || !Array.isArray(value.goals) || !Array.isArray(value.bills) || !value.budgets || typeof value.budgets !== "object") return demoState();
    const category = (item: unknown): item is Category => CATEGORIES.some((name) => name === item);
    return {
      salary: safeNumber(value.salary), sideIncome: safeNumber(value.sideIncome),
      expenses: value.expenses.filter((e): e is Expense => !!e && typeof e.id === "string" && category(e.category) && typeof e.date === "string" && typeof e.note === "string").map((e) => ({ ...e, amount: safeNumber(e.amount) })),
      budgets: Object.fromEntries(CATEGORIES.map((name) => [name, safeNumber(value.budgets?.[name])])) as Record<Category, number>,
      bills: value.bills.filter((b): b is Bill => !!b && typeof b.id === "string" && typeof b.name === "string").map((b) => ({ ...b, amount: safeNumber(b.amount), dueDay: Math.min(31, Math.max(1, Math.floor(safeNumber(b.dueDay)))) })),
      goals: value.goals.filter((g): g is Goal => !!g && typeof g.id === "string" && typeof g.name === "string" && typeof g.deadline === "string").map((g) => ({ ...g, target: safeNumber(g.target), saved: safeNumber(g.saved) })),
      emergencySavings: safeNumber(value.emergencySavings), xp: safeNumber(value.xp),
      badges: Array.isArray(value.badges) ? value.badges.filter((b): b is string => typeof b === "string") : [],
      decisions: Array.isArray(value.decisions) ? value.decisions.filter((d): d is Decision => !!d && typeof d.id === "string" && typeof d.label === "string" && typeof d.summary === "string" && typeof d.date === "string") : [],
      quizCompleted: value.quizCompleted === true,
    };
  } catch { return demoState(); }
}

export function MoneyProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, emptyState);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  useEffect(() => { rawDispatch({ type: "load", state: readStored() }); setReady(true); }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Private browsing can disable storage. */ } } }, [state, ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const dispatch = useCallback((action: Action) => {
    rawDispatch(action);
    const messages: Partial<Record<Action["type"], string>> = {
      "expense/add": "+10 XP · Expense added", "goal/add": "+25 XP · Goal created",
      "quiz/finish": "Risk quiz complete", "decision/lock": "+40 XP · Decision locked",
      demo: "Demo data loaded", reset: "Your data has been reset",
    };
    const message = messages[action.type];
    if (message) setToast({ id: Date.now(), message });
  }, []);
  const value = useMemo(() => ({ state, ready, dispatch, toast, dismissToast: () => setToast(null) }), [state, ready, dispatch, toast]);
  return <MoneyContext.Provider value={value}><MotionConfig reducedMotion="user">{children}</MotionConfig></MoneyContext.Provider>;
}

export function useMoney(): Store {
  const context = useContext(MoneyContext);
  if (!context) throw new Error("useMoney must be used inside MoneyProvider");
  return context;
}
