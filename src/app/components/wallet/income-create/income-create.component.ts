import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class IncomeCreateComponent implements OnInit {
  form!: FormGroup;
  expenseTypes: any[] = [];
  isLoading = false;
  user: any;
  destroy$ = new Subject<void>();
  id: string = '';
  income: any = {};
  wallets: any[] = [];

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
    });

    this.authService.getCurrentUserDetail().then(user => {
      this.user = user;
      this.getWallets(this.user.id);
      if (this.id) {
        this.getIncomeDetail();
      }
    });

    this.route.params.subscribe(params => {
      this.id = params['id'];
      if (this.id && this.user?.id) {
        this.getIncomeDetail();
      }
    });
  }

  getWallets(id: string) {
    this.dataService.getUserWallets(id).subscribe((wallets) => {
      this.wallets = wallets;
    });
  }

  getIncomeDetail() {
    if (!this.id || !this.user?.id) return;

    this.dataService.getIncomeDetail(this.user.id, this.id).then((data) => {
      this.income = data?.data();
      this.form.patchValue(this.income);
      this.form.get('date')?.setValue(new Date(this.income.date));
    });
  }

  async submitIncome() {
    this.isLoading = true;
    const payload = {
      ...this.form.value,
      user: this.user,
      date: this.datepipe.transform(this.form.value.date, 'MMM dd, yyyy'),
      month: this.datepipe.transform(this.form.value.date, 'MMM, yyyy')
    };

    try {
      if (this.id && this.income) {
        await this.dataService.reverseIncomeWalletChanges(this.user.id, this.income);
      }

      await this.dataService.applyIncomeWalletChanges(this.user.id, payload);
      await this.dataService.saveIncome(payload, this.id);

      this.toastService.displayToast('success', 'Income', 'Income Saved!');
      setTimeout(() => {
        this.router.navigate(['/wallet']);
      }, 1000);
    } catch {
      this.toastService.displayToast('error', 'Error', 'Something went wrong!');
    } finally {
      this.isLoading = false;
    }
  }
}
