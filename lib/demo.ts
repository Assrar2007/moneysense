import type { MoneyState } from "@/lib/types";

const thisMonth = (day: number): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

export const demoState = (): MoneyState => ({
  salary: 32000,
  sideIncome: 5000,
  expenses: [
    { id: "d1", amount: 2400, category: "Food", date: thisMonth(3), note: "Groceries" },
    { id: "d2", amount: 900, category: "Transport", date: thisMonth(6), note: "Metro card" },
    { id: "d3", amount: 8500, category: "Housing", date: thisMonth(1), note: "Rent" },
    { id: "d4", amount: 699, category: "Bills", date: thisMonth(8), note: "Phone + data", recurring: true },
    { id: "d5", amount: 1200, category: "Shopping", date: thisMonth(12), note: "Books" },
    { id: "d6", amount: 450, category: "Food", date: thisMonth(15), note: "UPI at café" },
    { id: "d7", amount: 1200, category: "Health", date: thisMonth(18), note: "Checkup" },
  ],
  budgets: { Food: 5000, Transport: 2500, Housing: 9000, Shopping: 3000, Bills: 2200, Health: 2000, Other: 1500 },
  bills: [{ id: "b1", name: "Phone plan", amount: 699, dueDay: 8, isEmi: false }],
  goals: [
    { id: "g1", name: "Emergency fund", target: 60000, saved: 18000, deadline: "2027-12-31" },
    { id: "g2", name: "New laptop", target: 45000, saved: 13500, deadline: "2027-08-31" },
  ],
  emergencySavings: 18000,
  xp: 120,
  badges: ["First steps"],
  decisions: [],
  quizCompleted: false,
});

export const emptyState = (): MoneyState => ({
  salary: 0, sideIncome: 0, expenses: [],
  budgets: { Food: 0, Transport: 0, Housing: 0, Shopping: 0, Bills: 0, Health: 0, Other: 0 },
  bills: [], goals: [], emergencySavings: 0, xp: 0, badges: [], decisions: [], quizCompleted: false,
});
