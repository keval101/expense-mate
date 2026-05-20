import {
  CategoryBreakdown,
  ExpenseTrackerResult,
  MonthlyBreakdown,
  TrendAnalysis,
} from '../models/analytics.model';
import {
  formatMonthLabel,
  getMonthKeysInRange,
  startOfDay,
  toMonthKey,
} from '../utils/date.utils';

export interface ExpenseRecord {
  id?: string;
  amount: number;
  date?: string;
  dateTs?: number;
  month?: string;
  monthKey?: string;
  selfTransfer?: boolean;
  type?: { id?: string; name?: string; type?: string };
  typeId?: string;
}

function getExpenseDateTs(expense: ExpenseRecord): number {
  if (expense.dateTs) return expense.dateTs;
  if (expense.date) {
    const parsed = new Date(expense.date);
    if (!isNaN(parsed.getTime())) return startOfDay(parsed).getTime();
  }
  if (expense.month) {
    const parsed = new Date(expense.month.replace(',', ''));
    if (!isNaN(parsed.getTime())) return startOfDay(parsed).getTime();
  }
  return 0;
}

function getExpenseMonthKey(expense: ExpenseRecord): string {
  if (expense.monthKey) return expense.monthKey;
  const ts = getExpenseDateTs(expense);
  if (ts) return toMonthKey(new Date(ts));
  return expense.month ?? 'unknown';
}

function getCategoryId(expense: ExpenseRecord): string {
  return expense.typeId ?? expense.type?.id ?? expense.type?.type ?? 'unknown';
}

function getCategoryName(expense: ExpenseRecord): string {
  return expense.type?.name ?? 'Unknown';
}

function getCategorySlug(expense: ExpenseRecord): string | undefined {
  return expense.type?.type;
}

export function filterExpensesForTracker(
  expenses: ExpenseRecord[],
  categoryIds: string[],
  fromTs: number,
  toTs: number,
  fromDate?: Date,
  toDate?: Date
): ExpenseRecord[] {
  const monthKeysInRange =
    fromDate && toDate ? getMonthKeysInRange(fromDate, toDate) : [];

  return expenses.filter((expense) => {
    if (expense.selfTransfer) return false;
    if (expense.type?.type === 'savings') return false;

    const ts = getExpenseDateTs(expense);
    const inRange =
      ts > 0
        ? ts >= fromTs && ts <= toTs
        : monthKeysInRange.some((mk) => legacyMonthMatches(expense.month, mk));

    if (!inRange) return false;

    if (categoryIds.length === 0) return true;

    const catId = getCategoryId(expense);
    const catSlug = getCategorySlug(expense);
    return categoryIds.includes(catId) || (catSlug ? categoryIds.includes(catSlug) : false);
  });
}

function legacyMonthMatches(month: string | undefined, monthKey: string): boolean {
  if (!month) return false;
  const [year, m] = monthKey.split('-');
  const date = new Date(Number(year), Number(m) - 1, 1);
  const legacy = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(' ', ', ');
  return month === legacy;
}

export function computeExpenseTrackerResult(
  expenses: ExpenseRecord[],
  fromDate: Date,
  toDate: Date
): ExpenseTrackerResult {
  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthKeys = getMonthKeysInRange(fromDate, toDate);

  const monthlyMap = new Map<string, number>();
  monthKeys.forEach((key) => monthlyMap.set(key, 0));

  const categoryMap = new Map<string, { name: string; slug?: string; total: number }>();

  expenses.forEach((expense) => {
    const monthKey = getExpenseMonthKey(expense);
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + expense.amount);

    const catId = getCategoryId(expense);
    const existing = categoryMap.get(catId) ?? {
      name: getCategoryName(expense),
      slug: getCategorySlug(expense),
      total: 0,
    };
    existing.total += expense.amount;
    categoryMap.set(catId, existing);
  });

  const monthlyBreakdown: MonthlyBreakdown[] = monthKeys.map((monthKey) => ({
    monthKey,
    label: formatMonthLabel(monthKey),
    total: monthlyMap.get(monthKey) ?? 0,
  }));

  const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      categorySlug: data.slug,
      total: data.total,
      percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const highestCategory = categoryBreakdown[0] ?? null;
  const monthsWithData = monthlyBreakdown.filter((m) => m.total > 0).length || 1;
  const averageMonthlySpending = totalAmount / monthsWithData;

  return {
    totalAmount,
    monthlyBreakdown,
    categoryBreakdown,
    highestCategory,
    averageMonthlySpending,
    trend: computeTrend(monthlyBreakdown),
  };
}

function computeTrend(monthlyBreakdown: MonthlyBreakdown[]): TrendAnalysis {
  const nonZero = monthlyBreakdown.filter((m) => m.total > 0);
  if (nonZero.length < 2) {
    return { direction: 'flat', changePercent: 0, comparisonLabel: 'Not enough data' };
  }

  const current = nonZero[nonZero.length - 1].total;
  const previous = nonZero[nonZero.length - 2].total;

  if (previous === 0) {
    return { direction: current > 0 ? 'up' : 'flat', changePercent: 0, comparisonLabel: 'vs previous month' };
  }

  const changePercent = ((current - previous) / previous) * 100;
  const direction = changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'flat';

  return {
    direction,
    changePercent: Math.abs(Math.round(changePercent)),
    comparisonLabel: 'vs previous month',
  };
}

export function computeCategoryComparison(
  currentExpenses: ExpenseRecord[],
  previousExpenses: ExpenseRecord[]
): { categoryName: string; current: number; previous: number }[] {
  const currentMap = new Map<string, { name: string; total: number }>();
  const previousMap = new Map<string, { name: string; total: number }>();

  currentExpenses.forEach((e) => {
    const id = getCategoryId(e);
    const entry = currentMap.get(id) ?? { name: getCategoryName(e), total: 0 };
    entry.total += e.amount;
    currentMap.set(id, entry);
  });

  previousExpenses.forEach((e) => {
    const id = getCategoryId(e);
    const entry = previousMap.get(id) ?? { name: getCategoryName(e), total: 0 };
    entry.total += e.amount;
    previousMap.set(id, entry);
  });

  const allIds = new Set([...currentMap.keys(), ...previousMap.keys()]);

  return Array.from(allIds)
    .map((id) => ({
      categoryName: currentMap.get(id)?.name ?? previousMap.get(id)?.name ?? 'Unknown',
      current: currentMap.get(id)?.total ?? 0,
      previous: previousMap.get(id)?.total ?? 0,
    }))
    .sort((a, b) => b.current - a.current);
}
