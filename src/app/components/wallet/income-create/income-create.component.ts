import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { SharedModule } from '../../../shared/shared.module';
import { Subject } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service';
import { DataService } from '../../../shared/services/data.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-income-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    DatePickerModule,
    SelectModule
  ],
  providers: [DatePipe],
  templateUrl: './income-create.component.html',
  styleUrl: './income-create.component.scss'
})
export class IncomeCreateComponent {
  form!: FormGroup;
  expenseTypes: any[] = [];
  isLoading = false;
  user: any;
  destroy$ = new Subject<void>();
  id: string = '';
  income: any = {}; 
  wallets: any[] = [];
  selectedWallet: any;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private authService: AuthService,
    private datepipe: DatePipe,
    private router: Router,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      amount: ['', Validators.required],
      date: ['', Validators.required],
      wallet: ['', Validators.required]
    })

    this.authService.getCurrentUserDetail().then(user => {
      this.user = user;
      this.getWallets(this.user.id);
    })

    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.getExpenseDetail();
    });
  }

  getWallets(id: string) {
    console.log(id);
    this.dataService.getUserWallets(id).subscribe((wallets) => {
      this.wallets = wallets;
      console.log(this.wallets);
    });
  }

  getExpenseDetail() {
    this.dataService.getExpenseDetail(this.id).then((data) => {
      this.income = data?.data();
      this.form.patchValue(this.income)
      // this.form.get('date')?.setValue(new Date(this.income.date));
    });
  }

  async submitIncome() {
    this.isLoading = true;
    const payload = {
      ...this.form.value,
      user: this.user,
      date: this.datepipe.transform(this.form.value.date, 'MMM dd, yyyy'),
      month: this.datepipe.transform(this.form.value.date, 'MMM, yyyy')
    }

    // update wallet balance
    const wallet = payload.wallet;
    if(wallet) {
      wallet.balance = wallet.balance + payload.amount;
      await this.dataService.updateWallet(wallet.id, wallet.user.id, wallet.balance);
    }

    this.dataService.saveIncome(payload, this.id).then((data) => {
      this.toastService.displayToast('success', 'Income', 'Income Saved!');
      this.isLoading = false;
      setTimeout(() => {
        this.router.navigate(['/wallet'])
      }, 1000);
    }).catch(() => {
      this.toastService.displayToast('error', 'Error', 'Something went wrong!');
      this.isLoading = false;
    });
  }
}
