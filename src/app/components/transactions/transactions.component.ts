import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExpenseTypeIcons } from '../../shared/enum/enum';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions',
  imports: [
    RouterModule,
    SharedModule,
    CommonModule
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent {

  user: any;
  expenses: any[] = [];
  isLoading = true;

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.getCurrentUserDetail().then(user => {
      this.user = user;
      this.getExpenses();
    })
  }

  getIcon(type: string | undefined): string {
    return type && type in ExpenseTypeIcons
      ? ExpenseTypeIcons[type as keyof typeof ExpenseTypeIcons]
      : '/icons/others.svg';
  }

  getExpenses() {
    this.isLoading = true;
    this.dataService.getExpenses(this.user.id).subscribe(expenses => {
      this.isLoading = false;
      this.expenses = expenses;
    })
  }
}
