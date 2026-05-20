import { FinanceOverview, MonthlyBreakdown } from '../models/analytics.model';
import { Savings } from '../models/savings.model';
import { formatMonthLabel, getMonthKeysInRange, startOfDay } from '../utils/date.utils';

export interface IncomeRecord {
  amount: number;
  dateTs?: number;
  date?: string;
  month?: string;
  monthKey?: string;
}

export interface ExpenseRecord {
  amount: number;
  selfTransfer?: boolean;
  dateTs?: number;
  date?: string;
  month?: string;
  monthKey?: string;
  type?: { type?: string };
}

function getRecordDateTs(record: { dateTs?: number; date?: string; month?: string }): number {
  if (record.dateTs) return record.dateTs;
  if (record.date) {
    const parsed = new Date(record.date);
    if (!isNaN(parsed.getTime())) return startOfDay(parsed).getTime();
  }
  if (record.month) {
    const parsed = new Date(record.month.replace(',', ''));
    if (!isNaN(parsed.getTime())) return startOfDay(parsed).getTime();
  }
  return 0;
}

function legacyMonthMatches(month: string | undefined, monthKey: string): boolean {
  if (!month) return false;
  const [year, m] = monthKey.split('-');
  const date = new Date(Number(year), Number(m) - 1, 1);
  const legacy = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(' ', ', ');
  return month === legacy;
}

function isInRange(
  record: { dateTs?: number; date?: string; month?: string },
  fromTs: number,
  toTs: number,
  fromDate: Date,
  toDate: Date
): boolean {
  const ts = getRecordDateTs(record);
  if (ts > 0) return ts >= fromTs && ts <= toTs;
  const monthKeys = getMonthKeysInRange(fromDate, toDate);
  return monthKeys.some((mk) => legacyMonthMatches(record.month, mk));
}

export function computeFinanceOverview(
  incomes: IncomeRecord[],
  expenses: ExpenseRecord[],
  savings: Savings[],
  fromTs: number,
  toTs: number,
  fromDate?: Date,
  toDate?: Date
): FinanceOverview {
  const rangeFrom = fromDate ?? new Date(fromTs);
  const rangeTo = toDate ?? new Date(toTs);

  const totalIncome = incomes
    .filter((i) => isInRange(i, fromTs, toTs, rangeFrom, rangeTo))
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpenses = expenses
    .filter((e) => !e.selfTransfer && e.type?.type !== 'savings')
    .filter((e) => isInRange(e, fromTs, toTs, rangeFrom, rangeTo))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSavings = savings
    .filter((s) => s.dateTs >= fromTs && s.dateTs <= toTs)
    .reduce((sum, s) => sum + s.amount, 0);

  const netBalance = totalIncome - totalExpenses - totalSavings;
  const savingsRatio = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  return { totalIncome, totalExpenses, totalSavings, netBalance, savingsRatio, expenseRatio };
}

export function computeMonthlyFinanceComparison(
  incomes: IncomeRecord[],
  expenses: ExpenseRecord[],
  savings: Savings[],
  fromDate: Date,
  toDate: Date
): { monthKey: string; label: string; income: number; expenses: number; savings: number }[] {
  const monthKeys = getMonthKeysInRange(fromDate, toDate);

  return monthKeys.map((monthKey) => ({
    monthKey,
    label: formatMonthLabel(monthKey),
    income: sumByMonthKey(incomes, monthKey),
    expenses: sumExpensesByMonthKey(expenses, monthKey),
    savings: savings.filter((s) => s.monthKey === monthKey).reduce((sum, s) => sum + s.amount, 0),
  }));
}

function sumInRange(items: IncomeRecord[], fromTs: number, toTs: number): number {
  return items
    .filter((i) => {
      const ts = i.dateTs ?? 0;
      return ts >= fromTs && ts <= toTs;
    })
    .reduce((sum, i) => sum + i.amount, 0);
}

function sumExpensesInRange(expenses: ExpenseRecord[], fromTs: number, toTs: number): number {
  return expenses
    .filter((e) => {
      if (e.selfTransfer || e.type?.type === 'savings') return false;
      const ts = e.dateTs ?? 0;
      return ts >= fromTs && ts <= toTs;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

function sumByMonthKey(items: IncomeRecord[], monthKey: string): number {
  return items
    .filter((i) => (i.monthKey ?? '') === monthKey || legacyMonthMatches(i.month, monthKey))
    .reduce((sum, i) => sum + i.amount, 0);
}

function sumExpensesByMonthKey(expenses: ExpenseRecord[], monthKey: string): number {
  return expenses
    .filter((e) => !e.selfTransfer && e.type?.type !== 'savings')
    .filter((e) => (e.monthKey ?? '') === monthKey || legacyMonthMatches(e.month, monthKey))
    .reduce((sum, e) => sum + e.amount, 0);
}

export function toMonthlyBreakdown(
  data: { monthKey: string; total: number }[]
): MonthlyBreakdown[] {
  return data.map((d) => ({
    monthKey: d.monthKey,
    label: formatMonthLabel(d.monthKey),
    total: d.total,
  }));
}
