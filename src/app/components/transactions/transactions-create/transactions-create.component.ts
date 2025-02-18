import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DataService } from '../../../shared/services/data.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

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
  templateUrl: './transactions-create.component.html',
  styleUrl: './transactions-create.component.scss'
})
export class TransactionsCreateComponent implements OnInit{

  form!: FormGroup;
  expenseTypes: any[] = [];
  isLoading = false;
  user: any;
  destroy$ = new Subject<void>();
  

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private authService: AuthService
  ) {}

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
      console.log(this.expenseTypes);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
