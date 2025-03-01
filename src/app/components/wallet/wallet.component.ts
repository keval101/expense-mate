import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-wallet',
  imports: [CommonModule, RouterModule, SharedModule],
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
  constructor(
    private datepipe: DatePipe,
    private dataService: DataService,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      this.totalIncome = this.user.remainingBalance;
      this.getIncomes();
    });
  }

  getIncomes() {
    this.isLoading = true;
    const month = this.datepipe.transform(new Date(), 'MMM, yyyy');
    this.dataService.getIncomes(this.user.id, month).subscribe((incomes) => {
      this.isLoading = false;
      this.incomes = incomes;
      // this.totalIncome = this.incomes?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    });
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
}
