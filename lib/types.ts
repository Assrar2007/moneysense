export const CATEGORIES = ["Food", "Transport", "Housing", "Shopping", "Bills", "Health", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];
export type Expense = { id: string; amount: number; category: Category; date: string; note: string; recurring?: boolean };
export type Goal = { id: string; name: string; target: number; saved: number; deadline: string };
export type Bill = { id: string; name: string; amount: number; dueDay: number; isEmi: boolean };
export type Decision = { id: string; label: string; summary: string; date: string };
export type MoneyState = {
  salary: number;
  sideIncome: number;
  expenses: Expense[];
  budgets: Record<Category, number>;
  bills: Bill[];
  goals: Goal[];
  emergencySavings: number;
  xp: number;
  badges: string[];
  decisions: Decision[];
  quizCompleted: boolean;
};
