import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DataService } from '../../../shared/services/data.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-transactions-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    SelectModule,
    DatePickerModule
  ],
  providers: [DatePipe],
  templateUrl: './transactions-create.component.html',
  styleUrl: './transactions-create.component.scss'
})
export class TransactionsCreateComponent implements OnInit {

  form!: FormGroup;
  expenseTypes: any[] = [];
  isLoading = true;
  user: any;
  destroy$ = new Subject<void>();


  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private authService: AuthService,
    private datepipe: DatePipe,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      amount: ['', Validators.required],
      date: ['', Validators.required]
    })

    this.authService.getCurrentUserDetail().then(user => {
      this.user = user;
      this.getExpenseTypes(this.user.id);
    })

  }

  getExpenseTypes(userId: string) {
    this.isLoading = true;
    this.dataService.getExpenseTypes(userId).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.expenseTypes = data;
      this.isLoading = false;
    });
  }

  submitExpense() {
    this.isLoading = true;
    const payload = {
      ...this.form.value,
      user: this.user,
      date: this.datepipe.transform(this.form.value.date, 'MMM dd, yyyy'),
      month: this.datepipe.transform(this.form.value.date, 'MMM, yyyy')
    }
    this.dataService.saveExpense(payload).then((data) => {
      this.toastService.displayToast('success', 'Expense', 'Expense Saved!');
      this.isLoading = false;
      setTimeout(() => {
        this.router.navigate(['/expenses'])
      }, 1000);
    }).catch(() => {
      this.toastService.displayToast('error', 'Error', 'Something went wrong!');
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
