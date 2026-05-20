import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service';
import { DataService } from '../../../shared/services/data.service';
import { SavingsService } from '../../../shared/services/savings.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SharedModule } from '../../../shared/shared.module';
import { SAVINGS_TYPE_CONFIG, SAVINGS_TYPES } from '../../../shared/enums/savings-type.enum';
import { Savings, SavingsType } from '../../../shared/models/savings.model';
import { Wallet } from '../../../shared/models/wallet.model';

@Component({
  selector: 'app-savings-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SelectModule,
    DatePickerModule,
    SharedModule,
    CurrencyPipe,
  ],
  templateUrl: './savings-form.component.html',
  styleUrl: './savings-form.component.scss',
})
export class SavingsFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  user: any;
  wallets: Wallet[] = [];
  isLoading = false;
  id = '';
  existingSavings: Savings | null = null;
  typeOptions = SAVINGS_TYPES.map((type) => ({
    type,
    label: SAVINGS_TYPE_CONFIG[type].label,
  }));
  destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dataService: DataService,
    private savingsService: SavingsService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      walletId: ['', Validators.required],
      date: [new Date(), Validators.required],
      note: [''],
      type: ['goal' as SavingsType, Validators.required],
    });

    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      this.loadWallets();
    });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.id = params['id'];
      if (this.id) {
        this.loadSavingsDetail();
      }
    });
  }

  loadWallets(): void {
    this.dataService
      .getUserWallets(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((wallets) => {
        this.wallets = wallets;
      });
  }

  async loadSavingsDetail(): Promise<void> {
    this.existingSavings = await this.savingsService.getSavingsById(this.user.id, this.id);
    if (this.existingSavings) {
      this.form.patchValue({
        title: this.existingSavings.title,
        amount: this.existingSavings.amount,
        walletId: this.existingSavings.walletId,
        date: new Date(this.existingSavings.dateTs),
        note: this.existingSavings.note,
        type: this.existingSavings.type,
      });
    }
  }

  selectWallet(wallet: Wallet): void {
    this.form.patchValue({ walletId: wallet.id });
  }

  get selectedWallet(): Wallet | undefined {
    return this.wallets.find((w) => w.id === this.form.value.walletId);
  }

  get projectedBalance(): number | null {
    const wallet = this.selectedWallet;
    const amount = Number(this.form.value.amount) || 0;
    if (!wallet) return null;
    if (this.id && this.existingSavings?.walletId === wallet.id) {
      return wallet.balance + this.existingSavings.amount - amount;
    }
    return wallet.balance - amount;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;

    this.isLoading = true;
    const value = this.form.value;

    try {
      if (this.id && this.existingSavings) {
        await this.savingsService.updateSavings(
          this.user.id,
          this.id,
          {
            title: value.title,
            amount: Number(value.amount),
            walletId: value.walletId,
            date: value.date,
            note: value.note,
            type: value.type,
          },
          this.existingSavings
        );
        this.toastService.displayToast('success', 'Savings', 'Savings updated!');
      } else {
        await this.savingsService.createSavings(this.user.id, {
          title: value.title,
          amount: Number(value.amount),
          walletId: value.walletId,
          date: value.date,
          note: value.note,
          type: value.type,
        });
        this.toastService.displayToast('success', 'Savings', 'Savings saved!');
      }

      setTimeout(() => this.router.navigate(['/savings']), 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong!';
      this.toastService.displayToast('error', 'Error', message);
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
