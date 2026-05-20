import { DateRangePreset } from '../enums/date-range-preset.enum';

export interface DateRangeFilter {
  fromDate?: Date;
  toDate?: Date;
  preset?: DateRangePreset;
}

export interface ExpenseTrackerFilter extends DateRangeFilter {
  categoryIds: string[];
}

export interface MonthlyBreakdown {
  monthKey: string;
  label: string;
  total: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categorySlug?: string;
  total: number;
  percentage: number;
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'flat';
  changePercent: number;
  comparisonLabel: string;
}

export interface ExpenseTrackerResult {
  totalAmount: number;
  monthlyBreakdown: MonthlyBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  highestCategory: CategoryBreakdown | null;
  averageMonthlySpending: number;
  trend: TrendAnalysis;
}

export interface FinanceOverview {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  netBalance: number;
  savingsRatio: number;
  expenseRatio: number;
}

export interface SavingsAnalyticsResult {
  totalSaved: number;
  monthlyBreakdown: MonthlyBreakdown[];
  typeBreakdown: { type: string; label: string; total: number; percentage: number }[];
  cumulativeGrowth: MonthlyBreakdown[];
}

export interface Insight {
  type: 'warning' | 'success' | 'info';
  message: string;
  metric?: number;
}

export interface ResolvedDateRange {
  fromTs: number;
  toTs: number;
  fromDate: Date;
  toDate: Date;
}
