import { monthlyIncome, percent, safeNumber } from "@/lib/finance";
import type { MoneyState } from "@/lib/types";

// Transparent heuristic for guidance, not a credit score or financial advice.
export function moneyHealth(state: MoneyState): number {
  const income = monthlyIncome(state.salary, state.sideIncome);
  if (income === 0) return 0;
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const spent = state.expenses.filter((e) => e.date.startsWith(month)).reduce((sum, e) => sum + safeNumber(e.amount), 0);
  const monthlyBills = state.bills.filter((b) => b.isEmi).reduce((sum, b) => sum + safeNumber(b.amount), 0);
  const spendingPoints = Math.max(0, 35 - Math.max(0, percent(spent, income) - 50) * 0.7);
  const emergencyPoints = Math.min(30, (state.emergencySavings / Math.max(spent, income * 0.35, 1)) * 10);
  const goalPoints = Math.min(20, state.goals.length * 10);
  const debtPoints = Math.max(0, 15 - percent(monthlyBills, income) * 0.5);
  const estimate = Math.round(Math.min(100, Math.max(0, spendingPoints + emergencyPoints + goalPoints + debtPoints)));
  return state.expenses.length === 0 ? Math.min(40, estimate) : estimate;
}

export const levelFromXp = (xp: number): number => Math.floor(safeNumber(xp) / 100) + 1;
