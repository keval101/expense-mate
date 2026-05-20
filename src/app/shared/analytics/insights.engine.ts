import { CategoryBreakdown, FinanceOverview, Insight } from '../models/analytics.model';
import { computeCategoryComparison, ExpenseRecord } from './expense-analytics.engine';

export function generateInsights(
  overview: FinanceOverview,
  categoryBreakdown: CategoryBreakdown[],
  currentExpenses: ExpenseRecord[],
  previousExpenses: ExpenseRecord[]
): Insight[] {
  const insights: Insight[] = [];

  if (overview.savingsRatio >= 10) {
    insights.push({
      type: 'success',
      message: `You saved ${Math.round(overview.savingsRatio)}% of your income this period`,
      metric: overview.savingsRatio,
    });
  } else if (overview.totalIncome > 0 && overview.savingsRatio < 5) {
    insights.push({
      type: 'warning',
      message: `Savings rate is low at ${Math.round(overview.savingsRatio)}%. Consider setting aside more.`,
      metric: overview.savingsRatio,
    });
  }

  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    insights.push({
      type: 'info',
      message: `${top.categoryName} is your highest spending category`,
      metric: top.total,
    });
  }

  const comparisons = computeCategoryComparison(currentExpenses, previousExpenses);
  comparisons.forEach((c) => {
    if (c.previous > 0) {
      const change = ((c.current - c.previous) / c.previous) * 100;
      if (change >= 15) {
        insights.push({
          type: 'warning',
          message: `${c.categoryName} expenses increased by ${Math.round(change)}%`,
          metric: change,
        });
      }
    }
  });

  if (overview.expenseRatio > 80) {
    insights.push({
      type: 'warning',
      message: `Expenses consume ${Math.round(overview.expenseRatio)}% of your income`,
      metric: overview.expenseRatio,
    });
  }

  if (overview.netBalance > 0 && overview.totalIncome > 0) {
    insights.push({
      type: 'success',
      message: `Net balance is positive at ${Math.round((overview.netBalance / overview.totalIncome) * 100)}% of income`,
    });
  }

  return insights.slice(0, 4);
}
