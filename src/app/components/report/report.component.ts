import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { SavingsService } from '../../shared/services/savings.service';
import { CommonModule, DatePipe } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { ExpenseTypeIcons } from '../../shared/enum/enum';
import { SharedModule } from '../../shared/shared.module';
import { Subject, takeUntil, forkJoin, from, take, catchError, of } from 'rxjs';
import { Savings } from '../../shared/models/savings.model';
import { groupSavingsByMonth } from '../../shared/analytics/savings-analytics.engine';

@Component({
  selector: 'app-report',
  imports: [
    CommonModule,
    AccordionModule,
    SharedModule,
  ],
  providers: [DatePipe],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ReportComponent implements OnDestroy {

  user: any;
  isLoading = false;
  allExpenses: any[] = [];
  allIncomes: any[] = [];
  allSavings: Savings[] = [];
  groupedExpenses: any[] = [];
  groupedIncomes: any[] = [];
  groupedSavings: ReturnType<typeof groupSavingsByMonth> = [];
  destroy$ = new Subject<void>();

  constructor(
    private dataService: DataService,
    private savingsService: SavingsService,
    private authService: AuthService,
    private datepipe: DatePipe
  ) {
    this.authService.getCurrentUserDetail().then(user => {
      this.user = user;
      this.loadReports();
    })
  }

  getIcon(type: string | undefined): string {
    return type && type in ExpenseTypeIcons
      ? ExpenseTypeIcons[type as keyof typeof ExpenseTypeIcons]
      : '/icons/others.svg';
  }

  loadReports(): void {
    this.isLoading = true;

    forkJoin({
      expenses: this.dataService.getExpenses(this.user.id).pipe(take(1)),
      incomes: this.dataService.getIncomes(this.user.id).pipe(take(1)),
      savings: from(this.savingsService.getSavingsOnce(this.user.id)).pipe(catchError(() => of([]))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ expenses, incomes, savings }) => {
          this.allExpenses = expenses;
          this.allIncomes = incomes;
          this.allSavings = savings;
          this.groupExpensesByMonth();
          this.groupIncomesByMonth();
          this.groupedSavings = groupSavingsByMonth(savings);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  groupExpensesByMonth() {
    const data: any[] = []
    this.allExpenses.reduce((acc, expense) => {
      const month = expense.month;
      if (!acc[month]) {
        acc[month] = [];
        data.push({ month, expenses: [] });
      }
      const index = data.findIndex(item => item.month === month);
      data[index].expenses.push(expense);
      acc[month].push(expense);
      return acc;
    }, {} as Record<string, any[]>);

    data.forEach(x => {
      x['topSpending'] = this.getTopSpending(x.expenses);
      x['totalExpense'] = x.expenses?.reduce((sum: number, item: any) => {
        if (item.selfTransfer || item.type?.type === 'savings') return sum;
        return sum + (item.amount || 0);
      }, 0) || 0;
      x['totalSavings'] = this.getSavingsForLegacyMonth(x.month);
      x['netBalance'] = (this.getMonthIncome(x.month) - x.totalExpense - x.totalSavings) || 0;
    })
    this.groupedExpenses = data.sort((a, b) => {
      return new Date(b.month).getTime() - new Date(a.month).getTime();
    });
  }

  getSavingsForLegacyMonth(legacyMonth: string): number {
    const savingsGroup = this.groupedSavings.find((g) => {
      const legacy = this.savingsService.toLegacyMonth(g.monthKey);
      return legacy === legacyMonth;
    });
    if (savingsGroup) return savingsGroup.total;

    // Fallback for old savings stored as expense type
    const monthExpenses = this.allExpenses.filter((e) => e.month === legacyMonth);
    return monthExpenses
      .filter((e) => e.type?.type === 'savings')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }

  groupIncomesByMonth() {
    const data: any[] = []
    this.allIncomes.reduce((acc, income) => {
      const month = income.month;
      if (!acc[month]) {
        acc[month] = [];
        data.push({ month, incomes: [] });
      }
      const index = data.findIndex(item => item.month === month);
      data[index].incomes.push(income);
      acc[month].push(income);
      return acc;
    }, {} as Record<string, any[]>);

    data.forEach(x => {
      x['totalIncome'] = x.incomes?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
    })
    this.groupedIncomes = data;
  }

  getTopSpending(expenses: any[]) {
    let sortedExpenses = [...expenses].sort((a, b) => b.amount - a.amount);
    sortedExpenses = sortedExpenses.filter(expense =>
      expense.type?.type != 'savings' && expense.type?.type != 'emi' && expense.type?.type != 'pocketMoney'
    );
    return sortedExpenses[0];
  }

  getMonthIncome(month: string) {
    const income = this.groupedIncomes.find(x => x.month === month);
    return income?.totalIncome || 0;
  }

  onFilter(): void {
    // Reserved for future date/category filtering
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
