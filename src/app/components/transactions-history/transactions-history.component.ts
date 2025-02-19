import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DataService } from '../../shared/services/data.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExpenseTypeIcons } from '../../shared/enum/enum';

@Component({
  selector: 'app-transactions-history',
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './transactions-history.component.html',
  styleUrl: './transactions-history.component.scss',
})
export class TransactionsHistoryComponent {
  isLoading = true;
  expenses: any[] = [];
  user: any;

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {
    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      this.getExpenses();
    });
  }

  getIcon(type: string | undefined): string {
    return type && type in ExpenseTypeIcons
      ? ExpenseTypeIcons[type as keyof typeof ExpenseTypeIcons]
      : '/icons/others.svg';
  }

  getExpenses() {
    this.isLoading = true;
    this.dataService.getExpenses(this.user.id).subscribe((expenses) => {
      this.isLoading = false;
      this.expenses = expenses;
      this.sortExpenses();
    });
  }

  sortExpenses() {
    this.expenses = this.expenses.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    this.expenses.length = this.expenses.length > 5 ? 5 : this.expenses.length;
  }
}
