import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { SharedModule } from '../../shared/shared.module';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-wallet',
  imports: [CommonModule, RouterModule, SharedModule, MultiSelectModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
})
export class WalletComponent {
  isLoading = true;
  incomes: any[] = [];
  user: any;
  totalIncome: number = 0;
  selectedItem: any;
  isDelete = false
  months = ['Jan, 2025', 'Feb, 2025', 'Mar, 2025', 'Apr, 2025', 'May, 2025', 'Jun, 2025', 'Jul, 2025', 'Aug, 2025', 'Sep, 2025', 'Oct, 2025', 'Nov, 2025', 'Dec, 2025'];
  selectedMonth: any;
  wallets: any[] = [];
  destroy$ = new Subject<void>();

  constructor(
    private datepipe: DatePipe,
    private dataService: DataService,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      this.totalIncome = this.user.remainingBalance;
      const month = this.datepipe.transform(new Date(), 'MMM, yyyy');
      this.selectedMonth = [month];
      this.getIncomes();
      this.getWallets();
    });
  }

  getIncomes() {
    this.isLoading = true;
    if(this.selectedMonth.length === 0) {
      this.isLoading = false;
      this.incomes = [];
    } else {
      this.dataService.getIncomes(this.user.id, this.selectedMonth).subscribe((incomes) => {
        this.isLoading = false;
        this.incomes = incomes;
      });
    }
  }
  
  getWallets() {
    this.dataService.getUserWallets(this.user.id).pipe(takeUntil(this.destroy$)).subscribe((wallets) => {
      this.wallets = wallets;
      this.totalIncome = this.wallets.reduce((acc, wallet) => acc + wallet.balance, 0);
      console.log(this.wallets);
    });
  }

  deleteWallet(item: any) {
    this.dataService.deleteWallet(item.id, item.user.id)
    this.toastService.displayToast('success', 'Wallet', 'Wallet Deleted!'); 
    this.getWallets();
  }

  async deleteIncome(item: any) {
    await this.dataService.deleteIncome(item.id, item.user.id)
    this.toastService.displayToast('success', 'Income', 'Income Deleted!'); 
   }

   setSelectedItem(item: any) {
    this.selectedItem = item;
    this.isDelete = true;
  }

   onCancel() {
    this.selectedItem = {};
    this.isDelete = false;
  }

  sortIncomes() {
    this.incomes = this.incomes.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
