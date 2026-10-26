// All rates are fractions (0.12 means 12%). All money values are rupees.
import type { Expense } from "@/lib/types";
export const safeNumber = (value: unknown, max = 1_000_000_000): number => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(0, number)) : 0;
};

export const rupees = (value: number): string =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(safeNumber(value, 1_000_000_000_000_000_000));

export const sharePercent = (part: number, whole: number): number =>
  whole > 0 ? (safeNumber(part, 1e18) / safeNumber(whole, 1e18)) * 100 : 0;

export const percent = (part: number, whole: number): number => Math.min(100, sharePercent(part, whole));

export const monthlyIncome = (salary: number, sideIncome: number): number =>
  safeNumber(salary) + safeNumber(sideIncome);

// Monthly compounding. Contributions are made at the end of each month.
export const futureValue = (monthly: number, principal: number, annualRate: number, years: number): number => {
  const months = Math.min(600, Math.floor(safeNumber(years, 50) * 12));
  const rate = Math.min(1, safeNumber(annualRate, 1)) / 12;
  const growth = Math.pow(1 + rate, months);
  return safeNumber(safeNumber(principal) * growth + safeNumber(monthly) * (rate === 0 ? months : (growth - 1) / rate), 1e18);
};

export const monthlyGoalAmount = (target: number, saved: number, months: number): number =>
  months > 0 ? Math.max(0, safeNumber(target) - safeNumber(saved)) / months : 0;

export const emi = (principal: number, annualRate: number, months: number): number => {
  const n = Math.floor(safeNumber(months, 600));
  if (n === 0) return 0;
  const rate = safeNumber(annualRate, 1) / 12;
  if (rate === 0) return safeNumber(principal) / n;
  const factor = Math.pow(1 + rate, n);
  return safeNumber(principal) * rate * factor / (factor - 1);
};

// Prefix comparison avoids timezone shifts from parsing ISO dates.
export const monthExpenses = (expenses: Expense[], year: number, month: number): Expense[] => {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return expenses.filter((expense) => expense.date.startsWith(prefix));
};

export const sumExpenses = (expenses: Expense[]): number =>
  expenses.reduce((total, expense) => total + safeNumber(expense.amount), 0);

export const monthlyNeeded = (target: number, saved: number, deadline: string, now = new Date()): number => {
  const end = new Date(`${deadline}T12:00:00`);
  if (Number.isNaN(end.getTime())) return 0;
  const months = Math.max(1, (end.getFullYear() - now.getFullYear()) * 12 + end.getMonth() - now.getMonth() + (end.getDate() >= now.getDate() ? 1 : 0));
  return monthlyGoalAmount(target, saved, months);
};
