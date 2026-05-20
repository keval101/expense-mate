import { SavingsAnalyticsResult, MonthlyBreakdown } from '../models/analytics.model';
import { Savings, SavingsType } from '../models/savings.model';
import { SAVINGS_TYPE_CONFIG } from '../enums/savings-type.enum';
import { formatMonthLabel, getMonthKeysInRange, toMonthKey } from '../utils/date.utils';

export function computeSavingsAnalytics(
  savings: Savings[],
  fromDate: Date,
  toDate: Date
): SavingsAnalyticsResult {
  const filtered = savings.filter((s) => s.dateTs >= fromDate.getTime() && s.dateTs <= toDate.getTime());
  const totalSaved = filtered.reduce((sum, s) => sum + s.amount, 0);
  const monthKeys = getMonthKeysInRange(fromDate, toDate);

  const monthlyMap = new Map<string, number>();
  monthKeys.forEach((key) => monthlyMap.set(key, 0));

  const typeMap = new Map<SavingsType, number>();
  filtered.forEach((s) => {
    monthlyMap.set(s.monthKey, (monthlyMap.get(s.monthKey) ?? 0) + s.amount);
    typeMap.set(s.type, (typeMap.get(s.type) ?? 0) + s.amount);
  });

  const monthlyBreakdown: MonthlyBreakdown[] = monthKeys.map((monthKey) => ({
    monthKey,
    label: formatMonthLabel(monthKey),
    total: monthlyMap.get(monthKey) ?? 0,
  }));

  let cumulative = 0;
  const cumulativeGrowth: MonthlyBreakdown[] = monthlyBreakdown.map((m) => {
    cumulative += m.total;
    return { ...m, total: cumulative };
  });

  const typeBreakdown = Array.from(typeMap.entries())
    .map(([type, total]) => ({
      type,
      label: SAVINGS_TYPE_CONFIG[type].label,
      total,
      percentage: totalSaved > 0 ? (total / totalSaved) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return { totalSaved, monthlyBreakdown, typeBreakdown, cumulativeGrowth };
}

export function computeTotalSavings(savings: Savings[], monthKey?: string): number {
  const list = monthKey ? savings.filter((s) => s.monthKey === monthKey) : savings;
  return list.reduce((sum, s) => sum + s.amount, 0);
}

export function groupSavingsByMonth(savings: Savings[]): { monthKey: string; label: string; items: Savings[]; total: number }[] {
  const map = new Map<string, Savings[]>();

  savings.forEach((s) => {
    const key = s.monthKey || toMonthKey(new Date(s.dateTs));
    const list = map.get(key) ?? [];
    list.push(s);
    map.set(key, list);
  });

  return Array.from(map.entries())
    .map(([monthKey, items]) => ({
      monthKey,
      label: formatMonthLabel(monthKey),
      items: items.sort((a, b) => b.dateTs - a.dateTs),
      total: items.reduce((sum, s) => sum + s.amount, 0),
    }))
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}
