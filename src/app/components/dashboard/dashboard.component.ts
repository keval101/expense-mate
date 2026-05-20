import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { TransactionsHistoryComponent } from '../transactions-history/transactions-history.component';
import { DataService } from '../../shared/services/data.service';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../shared/services/sidebar.service';
import { Subject, takeUntil } from 'rxjs';

export interface WeekChartBucket {
  label: string;
  amount: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    TransactionsHistoryComponent,
    SharedModule,
    RouterModule,
  ],
  providers: [DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnDestroy {
  name = '';
  expenses: any[] = [];
  user: any;
  totalExpense = 0;
  isLoading = true;
  month: string[] = [];
  weekBuckets: WeekChartBucket[] = [];
  chartMax = 3000;
  yAxisLabels: number[] = [];
  destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private datepipe: DatePipe,
    private sidebarService: SidebarService
  ) {
    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      this.name = `${this.user.first_name} ${this.user.last_name}`.trim();
      const month = this.datepipe.transform(new Date(), 'MMM, yyyy')!;
      this.month = [month];
      this.getExpenses();
    });
  }

  getExpenses(): void {
    this.dataService
      .getExpenses(this.user.id, this.month)
      .pipe(takeUntil(this.destroy$))
      .subscribe((expenses) => {
        this.expenses = expenses;
        this.totalExpense =
          this.expenses?.reduce(
            (sum, item) => sum + (item.selfTransfer ? 0 : item.amount),
            0
          ) || 0;
        this.buildChartData();
        this.isLoading = false;
      });
  }

  buildChartData(): void {
    const labels = ['1-7', '8-14', '15-21', '22-28', '29-31'];
    const amounts = [0, 0, 0, 0, 0];

    this.expenses.forEach((expense) => {
      if (expense.selfTransfer) return;
      const day = new Date(expense.date).getDate();
      const index = this.getWeekBucketIndex(day);
      amounts[index] += expense.amount || 0;
    });

    this.weekBuckets = labels.map((label, i) => ({
      label,
      amount: amounts[i],
    }));

    this.chartMax = this.getNiceMax(Math.max(...amounts, 1));
    this.yAxisLabels = this.buildYAxisLabels(this.chartMax);
  }

  getWeekBucketIndex(day: number): number {
    if (day <= 7) return 0;
    if (day <= 14) return 1;
    if (day <= 21) return 2;
    if (day <= 28) return 3;
    return 4;
  }

  getNiceMax(value: number): number {
    if (value <= 0) return 1000;
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const normalized = value / magnitude;
    let nice: number;
    if (normalized <= 1) nice = 1;
    else if (normalized <= 2) nice = 2;
    else if (normalized <= 5) nice = 5;
    else nice = 10;
    return nice * magnitude;
  }

  buildYAxisLabels(max: number): number[] {
    const step = max / 3;
    return [max, Math.round(step * 2), Math.round(step), 0];
  }

  getBarHeight(amount: number): number {
    if (!this.chartMax || amount <= 0) return 0;
    return Math.max((amount / this.chartMax) * 100, amount > 0 ? 4 : 0);
  }

  formatAxisLabel(value: number): string {
    return value.toLocaleString('en-IN');
  }

  openMenu(): void {
    this.sidebarService.open();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
