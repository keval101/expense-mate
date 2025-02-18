import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExpenseTypeIcons } from '../../shared/enum/enum';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule, DatePipe } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { TransactionsFilterComponent } from './transactions-filter/transactions-filter.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-transactions',
  imports: [
    RouterModule,
    SharedModule,
    CommonModule,
    DrawerModule,
    TransactionsFilterComponent
  ],
  providers: [DatePipe],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class TransactionsComponent {

  user: any;
  expenses: any[] = [];
  isLoading = true;
  filter = false;
  filterValue: any = {};

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
      this.setDrawerPosition();
    }
  

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private datepipe: DatePipe,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.authService.getCurrentUserDetail().then(user => {
      this.user = user;
      this.getExpenses();
    })
  }

  onFilter() {
    this.filter = true;
    this.setDrawerPosition()
  }

  setDrawerPosition(): void { 
    setTimeout(() => {      
      const mobileContainer = document.querySelector('.mobile-container') as HTMLElement;
      const sidebar = document.querySelector('.custom-drawer') as HTMLElement;
      console.log(sidebar, mobileContainer)
      if (mobileContainer && sidebar) {
        const containerRect = mobileContainer.getBoundingClientRect(); // Get position relative to viewport
        const containerWidth = containerRect.width;
        const sidebarWidth = containerWidth * 0.85; // Sidebar is 85% of mobile-container
        const leftPosition = containerRect.x; // Calculate actual left position
  
  
        sidebar.style.left = `${leftPosition}px`;
      }
    }, 0);
  }

  getIcon(type: string | undefined): string {
    return type && type in ExpenseTypeIcons
      ? ExpenseTypeIcons[type as keyof typeof ExpenseTypeIcons]
      : '/icons/others.svg';
  }

  onFilteration(filterValue: any) {
    this.filterValue = filterValue;
    console.log(this.filterValue)
    this.expenses = this.expenses.filter(expense => {
      let isValid = true;

      if (filterValue.month) {
        isValid = isValid && expense.date.includes(filterValue.month);
      }
    
      if (filterValue.type) {
        isValid = isValid && expense.type.name === filterValue.type;
      }
    
      return isValid;
    })

    console.log(filterValue.topSpending, this.expenses);
    if(filterValue.topSpending) {
      this.expenses = this.expenses.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    }

    console.log(this.expenses);
  }

  getExpenses() {
    this.isLoading = true;
    this.dataService.getExpenses(this.user.id).subscribe(expenses => {
      this.isLoading = false;
      this.expenses = expenses;
      const month = this.datepipe.transform(new Date(), 'MMM, yyyy')
      this.filterValue = {
        month: [month],
      };
    })
  }

  async deleteExpense(item: any) {
   await this.dataService.deleteExpense(item.id, item.user.id)
   this.toastService.displayToast('success', 'Expense', 'Expense Deleted!');
  }
}
