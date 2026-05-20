import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin, take, catchError, of } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { ExpenseTrackerFilter, ExpenseTrackerResult, Insight } from '../../shared/models/analytics.model';
import { DateRangePreset } from '../../shared/enums/date-range-preset.enum';
import { SharedModule } from '../../shared/shared.module';
import { StatCardComponent } from '../../shared/components/ui/stat-card/stat-card.component';
import { QuickFilterChipsComponent } from '../../shared/components/filters/quick-filter-chips/quick-filter-chips.component';
import { DateRangeFilterComponent } from '../../shared/components/filters/date-range-filter/date-range-filter.component';
import { CategoryMultiSelectComponent, CategoryOption } from '../../shared/components/filters/category-multi-select/category-multi-select.component';
import { LineChartComponent } from '../../shared/components/charts/line-chart/line-chart.component';
import { BarChartComponent } from '../../shared/components/charts/bar-chart/bar-chart.component';
import { DoughnutChartComponent } from '../../shared/components/charts/doughnut-chart/doughnut-chart.component';
import { InsightBannerComponent } from '../../shared/components/ui/insight-banner/insight-banner.component';
import { EmptyStateComponent } from '../../shared/components/ui/empty-state/empty-state.component';
import { computeCategoryComparison, filterExpensesForTracker } from '../../shared/analytics/expense-analytics.engine';
import { resolveDateRange, subMonths, startOfMonth, endOfMonth } from '../../shared/utils/date.utils';

@Component({
  selector: 'app-expense-tracker',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    StatCardComponent,
    QuickFilterChipsComponent,
    DateRangeFilterComponent,
    CategoryMultiSelectComponent,
    LineChartComponent,
    BarChartComponent,
    DoughnutChartComponent,
    InsightBannerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './expense-tracker.component.html',
  styleUrl: './expense-tracker.component.scss',
})
export class ExpenseTrackerComponent implements OnDestroy {
  user: any;
  isLoading = true;
  categories: CategoryOption[] = [];
  allExpenses: any[] = [];
  result: ExpenseTrackerResult | null = null;
  insights: Insight[] = [];
  comparisonLabels: string[] = [];
  comparisonCurrent: number[] = [];
  comparisonPrevious: number[] = [];
  trendLabels: string[] = [];
  trendData: number[] = [];
  categoryLabels: string[] = [];
  categoryData: number[] = [];
  comparisonDatasets: { label: string; data: number[]; color?: string }[] = [];
  trendDatasets: { label: string; data: number[]; color?: string; fill?: boolean }[] = [];

  filter: ExpenseTrackerFilter = {
    categoryIds: [],
    preset: 'this_month',
  };

  destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private analyticsService: AnalyticsService
  ) {
    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      this.loadCategories();
      this.loadData();
    });
  }

  loadCategories(): void {
    this.dataService
      .getExpenseTypes(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((types) => {
        this.categories = types
          .filter((t: any) => t.type !== 'savings')
          .map((t: any) => ({ id: t.id, name: t.name, slug: t.type }));
      });
  }

  loadData(): void {
    this.isLoading = true;

    forkJoin({
      tracker: this.analyticsService.trackExpenses(this.user.id, this.filter),
      expenses: this.dataService.getExpenses(this.user.id).pipe(take(1)),
      insights: this.analyticsService.getInsights(this.user.id, this.filter.preset ?? 'this_month').pipe(
        catchError(() => of([]))
      ),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ tracker, expenses, insights }) => {
          this.result = tracker;
          this.allExpenses = expenses;
          this.insights = insights;
          this.trendLabels = tracker.monthlyBreakdown.map((m) => m.label);
          this.trendData = tracker.monthlyBreakdown.map((m) => m.total);
          this.trendDatasets = [
            { label: 'Spending', data: this.trendData, color: '#EF4444', fill: true },
          ];
          this.categoryLabels = tracker.categoryBreakdown.map((c) => c.categoryName);
          this.categoryData = tracker.categoryBreakdown.map((c) => c.total);
          this.buildComparisonChart();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  buildComparisonChart(): void {
    const preset = this.filter.preset ?? 'this_month';
    const range = resolveDateRange(preset, this.filter.fromDate, this.filter.toDate);
    const prevRange = resolveDateRange(
      'custom',
      startOfMonth(subMonths(range.fromDate, 1)),
      endOfMonth(subMonths(range.fromDate, 1))
    );

    const current = filterExpensesForTracker(
      this.allExpenses,
      this.filter.categoryIds,
      range.fromTs,
      range.toTs,
      range.fromDate,
      range.toDate
    );
    const previous = filterExpensesForTracker(
      this.allExpenses,
      this.filter.categoryIds,
      prevRange.fromTs,
      prevRange.toTs,
      prevRange.fromDate,
      prevRange.toDate
    );

    const comparison = computeCategoryComparison(current, previous).slice(0, 6);
    this.comparisonLabels = comparison.map((c) => c.categoryName);
    this.comparisonCurrent = comparison.map((c) => c.current);
    this.comparisonPrevious = comparison.map((c) => c.previous);
    this.comparisonDatasets = [
      { label: 'Current', data: this.comparisonCurrent, color: '#EF4444' },
      { label: 'Previous', data: this.comparisonPrevious, color: '#6B7280' },
    ];
  }

  onPresetChange(preset: DateRangePreset): void {
    this.filter = { ...this.filter, preset };
    this.loadData();
  }

  onCategoryChange(categoryIds: string[]): void {
    this.filter = { ...this.filter, categoryIds };
    this.loadData();
  }

  onDateRangeChange(range: { fromDate?: Date; toDate?: Date }): void {
    this.filter = {
      ...this.filter,
      preset: 'custom',
      fromDate: range.fromDate,
      toDate: range.toDate,
    };
    this.loadData();
  }

  get trendLabel(): string {
    if (!this.result) return '';
    const { direction, changePercent } = this.result.trend;
    if (direction === 'flat') return 'Spending is stable';
    const arrow = direction === 'up' ? '↑' : '↓';
    return `${arrow} ${changePercent}% ${this.result.trend.comparisonLabel}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
