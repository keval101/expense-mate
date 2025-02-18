import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-wallet',
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
})
export class WalletComponent {
  isLoading = true;
  incomes: any[] = [];
  user: any;
  constructor(
    private datepipe: DatePipe,
    private dataService: DataService,
    private authService: AuthService
  ) {
    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      this.getIncomes();
    });
  }

  getIncomes() {
    this.isLoading = true;
    const month = this.datepipe.transform(new Date(), 'MMM, yyyy');
    this.dataService.getIncomes(this.user.id, month).subscribe((incomes) => {
      this.isLoading = false;
      this.incomes = incomes;
    });
  }
}
