import { DateRangePreset } from '../enums/date-range-preset.enum';
import { ResolvedDateRange } from '../models/analytics.model';

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

export function endOfYear(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), 11, 31));
}

export function subMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - months, date.getDate());
}

export function toMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function legacyMonthKey(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(' ', ', ');
}

export function resolveDateRange(preset: DateRangePreset, fromDate?: Date, toDate?: Date): ResolvedDateRange {
  const now = new Date();

  switch (preset) {
    case 'this_month':
      return toRange(startOfMonth(now), endOfMonth(now));
    case 'last_3_months':
      return toRange(startOfMonth(subMonths(now, 2)), endOfMonth(now));
    case 'last_6_months':
      return toRange(startOfMonth(subMonths(now, 5)), endOfMonth(now));
    case 'this_year':
      return toRange(startOfYear(now), endOfYear(now));
    case 'custom':
      return toRange(startOfDay(fromDate ?? startOfMonth(now)), endOfDay(toDate ?? endOfMonth(now)));
    default:
      return toRange(startOfMonth(now), endOfMonth(now));
  }
}

function toRange(fromDate: Date, toDate: Date): ResolvedDateRange {
  return {
    fromDate,
    toDate,
    fromTs: startOfDay(fromDate).getTime(),
    toTs: endOfDay(toDate).getTime(),
  };
}

export function getMonthKeysInRange(fromDate: Date, toDate: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const end = new Date(toDate.getFullYear(), toDate.getMonth(), 1);

  while (cursor <= end) {
    keys.push(toMonthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return keys;
}
