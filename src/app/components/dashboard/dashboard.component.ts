import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { TransactionsHistoryComponent } from '../transactions-history/transactions-history.component';
import { DataService } from '../../shared/services/data.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TransactionsHistoryComponent, SharedModule],
  providers: [DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  greeting: string = '';
  name: string = '';
  incomes: any[] = [];
  expenses: any[] = [];
  user: any;
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;
  isLoading = true;
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private datepipe: DatePipe
  ) {
    this.greeting = this.getGreeting();

    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      this.name = this.user.first_name + ' ' + this.user.last_name;
      this.getIncomes();
      this.getExpenses();
    });
  }

  getIncomes() {
    const month = this.datepipe.transform(new Date(), 'MMM, yyyy');
    this.dataService.getIncomes(this.user.id, month).subscribe((incomes) => {
      this.incomes = incomes;
      this.setBalance();
    });
  }

  getExpenses() {
    this.dataService.getExpenses(this.user.id).subscribe(expenses => {
      this.expenses = expenses;
      this.setBalance();
    })
  }

  setBalance() {
    this.totalIncome = this.incomes?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    this.totalExpense = this.expenses?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    this.balance = this.totalIncome - this.totalExpense;    
    this.isLoading = false;
  }

  getGreeting() {
    const hours = new Date().getHours();
    let greeting;

    if (hours < 12) {
      greeting = 'Good morning';
    } else if (hours < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    return `${greeting}`;
  }
}
