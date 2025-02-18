import { Component, OnInit } from '@angular/core';
import { DataService } from '../../shared/services/data.service';
import { ExpenseTypeIcons } from '../../shared/enum/enum';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-expense-types',
  imports: [
    SharedModule,
    RouterModule
  ],
  templateUrl: './expense-types.component.html',
  styleUrl: './expense-types.component.scss'
})
export class ExpenseTypesComponent implements OnInit{

  expenseTypes: any[] = [];
  icons = ExpenseTypeIcons;
  isLoading = false;
  user: any;
  destroy$ = new Subject<void>();

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit(){
    this.authService.getCurrentUserDetail().then(user => {
      this.user = user;
      this.getExpenseTypes(this.user.id);
    })
  }
  
  getIcon(type: string | undefined): string {
    return type && type in ExpenseTypeIcons 
      ? ExpenseTypeIcons[type as keyof typeof ExpenseTypeIcons] 
      : '/icons/others.svg';
  }

  getExpenseTypes(userId: string) {
    this.isLoading = true;
    this.dataService.getExpenseTypes(userId).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.expenseTypes = data;
      this.isLoading = false;
    });
  }

  deleteExpenseType(id: string) {
    this.dataService.deleteExpenseType(id)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
