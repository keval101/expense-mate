import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { SavingsAnalyticsResult } from '../../../shared/models/analytics.model';
import { DateRangePreset } from '../../../shared/enums/date-range-preset.enum';
import { SharedModule } from '../../../shared/shared.module';
import { StatCardComponent } from '../../../shared/components/ui/stat-card/stat-card.component';
import { QuickFilterChipsComponent } from '../../../shared/components/filters/quick-filter-chips/quick-filter-chips.component';
import { LineChartComponent } from '../../../shared/components/charts/line-chart/line-chart.component';
import { DoughnutChartComponent } from '../../../shared/components/charts/doughnut-chart/doughnut-chart.component';
import { BarChartComponent } from '../../../shared/components/charts/bar-chart/bar-chart.component';

@Component({
  selector: 'app-savings-analytics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    StatCardComponent,
    QuickFilterChipsComponent,
    LineChartComponent,
    DoughnutChartComponent,
    BarChartComponent,
  ],
  templateUrl: './savings-analytics.component.html',
  styleUrl: './savings-analytics.component.scss',
})
export class SavingsAnalyticsComponent implements OnDestroy {
  user: any;
  isLoading = true;
  preset: DateRangePreset = 'last_6_months';
  analytics: SavingsAnalyticsResult | null = null;
  growthLabels: string[] = [];
  growthData: number[] = [];
  monthlyLabels: string[] = [];
  monthlyData: number[] = [];
  typeLabels: string[] = [];
  typeData: number[] = [];
  avgMonthly = 0;
  destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService
  ) {
    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      this.loadAnalytics();
    });
  }

  loadAnalytics(): void {
    this.isLoading = true;
    this.analyticsService
      .getSavingsAnalytics(this.user.id, this.preset)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.analytics = result;
          this.growthLabels = result.cumulativeGrowth.map((m) => m.label);
          this.growthData = result.cumulativeGrowth.map((m) => m.total);
          this.monthlyLabels = result.monthlyBreakdown.map((m) => m.label);
          this.monthlyData = result.monthlyBreakdown.map((m) => m.total);
          this.typeLabels = result.typeBreakdown.map((t) => t.label);
          this.typeData = result.typeBreakdown.map((t) => t.total);
          const activeMonths = result.monthlyBreakdown.filter((m) => m.total > 0).length || 1;
          this.avgMonthly = result.totalSaved / activeMonths;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onPresetChange(preset: DateRangePreset): void {
    this.preset = preset;
    this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
