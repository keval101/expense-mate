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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs';

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
  allExpenses: any[] = [];
  isLoading = true;
  filter = false;
  filterValue: any = {};
  totalExpense = 0
  selectedItem: any = {};
  isDelete = false;
  searchValue = '';
  selectedMonths: any[] = [];
  destroy$ = new Subject<boolean>();

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
      this.selectedMonths = [this.datepipe.transform(new Date(), 'MMM, yyyy')];
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
      if (mobileContainer && sidebar) {
        const containerRect = mobileContainer.getBoundingClientRect(); // Get position relative to viewport
        const containerWidth = containerRect.width;
        const sidebarWidth = containerWidth; // Sidebar is 85% of mobile-container
        const leftPosition = containerRect.x; // Calculate actual left position
  
  
        sidebar.style.left = `${leftPosition}px`;
        sidebar.style.width = `${sidebarWidth}px`;
      }
    }, 0);
  }

  getIcon(type: string | undefined): string {
    return type && type in ExpenseTypeIcons
      ? ExpenseTypeIcons[type as keyof typeof ExpenseTypeIcons]
      : '/icons/others.svg';
  }

  async onFilteration(filterValue: any) {
    this.filterValue = filterValue;
    this.selectedMonths = filterValue.month;
    this.getExpenses(true);
  }

  filterData() {
    this.expenses = this.allExpenses.filter(expense => {
      let isValid = true;

      if (this.filterValue?.month?.length) {
        isValid = isValid && this.filterValue.month.includes(expense.month);
      }
    
      if (this.filterValue?.type?.length) {
        isValid = isValid && this.filterValue.type.includes(expense.type.type); 
      }
    
      return isValid;
    })

    if(this.filterValue?.topSpending) {
      this.expenses = this.allExpenses.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    }

    this.setTotalExpense();
  }

  getExpenses(filter = false) {
    this.isLoading = true;
    this.dataService.getExpenses(this.user.id, this.selectedMonths).pipe(takeUntil(this.destroy$)).subscribe(expenses => {
      this.isLoading = false;

      setTimeout(() => {
        this.expenses = expenses.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
  
          return dateB.getTime() - dateA.getTime();
        });

        this.allExpenses = JSON.parse(JSON.stringify(expenses));
        this.setTotalExpense();

      }, 0);
      if(this.searchValue) {
        this.onSearch(this.searchValue);
      }

      if(filter) {
        this.filterData();
      } else {
        this.filterValue = {
          month: this.selectedMonths,
        };
      }
      this.setTotalExpense();
    })
  }

  setTotalExpense() {
    this.sortExpenses();
    this.totalExpense = this.expenses?.reduce((sum, item) => {
      return sum + (item.selfTransfer ? 0 : item.amount);
    }, 0) || 0;
  }

  onSearch(value: string) {
    const search = value;
    this.searchValue = search;
    this.expenses = this.allExpenses.filter(expense => {
      return expense.name.toLowerCase().includes(search.toLowerCase());
    })
    console.log(this.expenses)
    this.setTotalExpense();
  }

  onCancel() {
    this.selectedItem = {};
    this.isDelete = false;
  }

  setSelectedItem(item: any, event: Event) {
    event.stopPropagation();
    this.selectedItem = item;
    this.isDelete = true;
  }

  async deleteExpense(item: any) {
    const wallet = item.wallet
    wallet.balance = wallet.balance + item.amount;
    await this.dataService.updateWallet(wallet.id, item.user.id, wallet.balance);

    await this.dataService.deleteExpense(item.id, item.user.id)
    this.toastService.displayToast('success', 'Expense', 'Expense Deleted!');
  }

  sortExpenses() {
    this.expenses = this.expenses.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return (b?.time || dateB) - (a?.time || dateA)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
