import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { SharedModule } from '../../shared/shared.module';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EmptyStateComponent } from '../../shared/components/ui/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../shared/components/ui/loading-skeleton/loading-skeleton.component';
import { DeleteComponent } from '../../shared/components/delete/delete.component';

@Component({
  selector: 'app-wallet',
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    MultiSelectModule,
    FormsModule,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    DeleteComponent,
  ],
  providers: [DatePipe],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
})
export class WalletComponent implements OnDestroy {
  isLoading = true;
  walletsLoading = true;
  incomes: any[] = [];
  user: any;
  totalBalance = 0;
  selectedItem: any = null;
  months: string[] = [];
  selectedMonth: string[] = [];
  wallets: any[] = [];
  destroy$ = new Subject<boolean>();
  selectedItemType: 'wallet' | 'income' | '' = '';
  deleteLabel = '';

  constructor(
    private datepipe: DatePipe,
    private dataService: DataService,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.months = this.buildMonthOptions();
    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      const month = this.datepipe.transform(new Date(), 'MMM, yyyy')!;
      this.selectedMonth = [month];
      this.getIncomes();
      this.getWallets();
    });
  }

  buildMonthOptions(): string[] {
    const options: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push(this.datepipe.transform(d, 'MMM, yyyy')!);
    }
    return options;
  }

  get bankBalance(): number {
    return this.wallets
      .filter((w) => w.type === 'bank')
      .reduce((sum, w) => sum + (w.balance || 0), 0);
  }

  get cashBalance(): number {
    return this.wallets
      .filter((w) => w.type === 'cash')
      .reduce((sum, w) => sum + (w.balance || 0), 0);
  }

  get monthIncomeTotal(): number {
    return this.incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  }

  getWalletTheme(index: number, type: string): string {
    if (type === 'cash') return 'wallet-card--cash';
    return index % 2 === 0 ? 'wallet-card--bank-a' : 'wallet-card--bank-b';
  }

  getIncomes(): void {
    this.isLoading = true;
    if (!this.selectedMonth?.length) {
      this.isLoading = false;
      this.incomes = [];
      return;
    }

    this.dataService.getIncomes(this.user.id, this.selectedMonth).subscribe((incomes) => {
      this.incomes = incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.isLoading = false;
    });
  }

  getWallets(): void {
    this.walletsLoading = true;
    this.dataService
      .getUserWallets(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((wallets) => {
        this.wallets = wallets;
        this.totalBalance = this.wallets.reduce((acc, wallet) => acc + (wallet.balance || 0), 0);
        this.walletsLoading = false;
      });
  }

  deleteWallet(item: any, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectedItem = item;
    this.selectedItemType = 'wallet';
    this.deleteLabel = item.name;
  }

  setSelectedItem(item: any, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectedItem = item;
    this.selectedItemType = 'income';
    this.deleteLabel = item.name;
  }

  onCancelDelete(): void {
    this.selectedItem = null;
    this.selectedItemType = '';
    this.deleteLabel = '';
  }

  async onConfirmDelete(): Promise<void> {
    if (!this.selectedItem) return;

    if (this.selectedItemType === 'wallet') {
      await this.dataService.deleteWallet(this.selectedItem.id, this.selectedItem.user.id);
      this.toastService.displayToast('success', 'Wallet', 'Wallet deleted!');
      this.getWallets();
    } else if (this.selectedItemType === 'income') {
      await this.deleteIncome(this.selectedItem);
      this.toastService.displayToast('success', 'Income', 'Income deleted!');
      this.getIncomes();
    }

    this.onCancelDelete();
  }

  async deleteIncome(item: any): Promise<void> {
    const wallet = item.wallet;
    if (wallet) {
      wallet.balance = wallet.balance - item.amount;
      await this.dataService.updateWallet(wallet.id, wallet.user.id, wallet.balance);
    }
    await this.dataService.deleteIncome(item.id, item.user.id);
    this.getWallets();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
