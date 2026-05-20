import { Injectable } from '@angular/core';
import { Observable, forkJoin, from, map, of, catchError, take } from 'rxjs';
import { DataService } from './data.service';
import { SavingsService } from './savings.service';
import {
  ExpenseTrackerFilter,
  ExpenseTrackerResult,
  FinanceOverview,
  Insight,
  SavingsAnalyticsResult,
} from '../models/analytics.model';
import { DateRangePreset } from '../enums/date-range-preset.enum';
import { resolveDateRange, subMonths, startOfMonth, endOfMonth } from '../utils/date.utils';
import {
  computeExpenseTrackerResult,
  filterExpensesForTracker,
} from '../analytics/expense-analytics.engine';
import { computeSavingsAnalytics } from '../analytics/savings-analytics.engine';
import {
  computeFinanceOverview,
  computeMonthlyFinanceComparison,
} from '../analytics/finance-analytics.engine';
import { generateInsights } from '../analytics/insights.engine';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(
    private dataService: DataService,
    private savingsService: SavingsService
  ) {}

  trackExpenses(userId: string, filter: ExpenseTrackerFilter): Observable<ExpenseTrackerResult> {
    const preset = filter.preset ?? 'this_month';
    const range = resolveDateRange(preset, filter.fromDate, filter.toDate);

    return this.dataService.getExpenses(userId).pipe(
      take(1),
      map((expenses) => {
        const filtered = filterExpensesForTracker(
          expenses,
          filter.categoryIds,
          range.fromTs,
          range.toTs,
          range.fromDate,
          range.toDate
        );
        return computeExpenseTrackerResult(filtered, range.fromDate, range.toDate);
      })
    );
  }

  getFinanceOverview(
    userId: string,
    preset: DateRangePreset = 'this_month',
    fromDate?: Date,
    toDate?: Date
  ): Observable<FinanceOverview> {
    const range = resolveDateRange(preset, fromDate, toDate);

    return forkJoin({
      expenses: this.dataService.getExpenses(userId).pipe(take(1)),
      incomes: this.dataService.getIncomes(userId).pipe(take(1)),
      savings: from(this.savingsService.getSavingsOnce(userId)).pipe(catchError(() => of([]))),
    }).pipe(
      map(({ expenses, incomes, savings }) =>
        computeFinanceOverview(incomes, expenses, savings, range.fromTs, range.toTs, range.fromDate, range.toDate)
      )
    );
  }

  getMonthlyFinanceComparison(userId: string, preset: DateRangePreset = 'last_6_months') {
    const range = resolveDateRange(preset);

    return forkJoin({
      expenses: this.dataService.getExpenses(userId).pipe(take(1)),
      incomes: this.dataService.getIncomes(userId).pipe(take(1)),
      savings: from(this.savingsService.getSavingsOnce(userId)).pipe(catchError(() => of([]))),
    }).pipe(
      map(({ expenses, incomes, savings }) =>
        computeMonthlyFinanceComparison(incomes, expenses, savings, range.fromDate, range.toDate)
      )
    );
  }

  getSavingsAnalytics(
    userId: string,
    preset: DateRangePreset = 'last_6_months',
    fromDate?: Date,
    toDate?: Date
  ): Observable<SavingsAnalyticsResult> {
    const range = resolveDateRange(preset, fromDate, toDate);

    return from(this.savingsService.getSavingsOnce(userId)).pipe(
      map((savings) => computeSavingsAnalytics(savings, range.fromDate, range.toDate))
    );
  }

  getInsights(userId: string, preset: DateRangePreset = 'this_month'): Observable<Insight[]> {
    const range = resolveDateRange(preset);
    const prevRange = resolveDateRange(
      'custom',
      startOfMonth(subMonths(range.fromDate, 1)),
      endOfMonth(subMonths(range.fromDate, 1))
    );

    return forkJoin({
      overview: this.getFinanceOverview(userId, preset),
      tracker: this.trackExpenses(userId, { categoryIds: [], preset }),
      expenses: this.dataService.getExpenses(userId).pipe(take(1)),
    }).pipe(
      map(({ overview, tracker, expenses }) => {
        const current = filterExpensesForTracker(
          expenses,
          [],
          range.fromTs,
          range.toTs,
          range.fromDate,
          range.toDate
        );
        const previous = filterExpensesForTracker(
          expenses,
          [],
          prevRange.fromTs,
          prevRange.toTs,
          prevRange.fromDate,
          prevRange.toDate
        );
        return generateInsights(overview, tracker.categoryBreakdown, current, previous);
      })
    );
  }
}
