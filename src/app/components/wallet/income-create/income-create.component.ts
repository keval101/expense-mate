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

@Component({
  selector: 'app-income-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    DatePickerModule
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
      date: ['', Validators.required]
    })

    this.authService.getCurrentUserDetail().then(user => {
      this.user = user;
    })

    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.getExpenseDetail();
    });
  }

  getExpenseDetail() {
    console.log(this.id)
    this.dataService.getExpenseDetail(this.id).then((data) => {
      this.income = data?.data();
      this.form.patchValue(this.income)
      this.form.get('date')?.setValue(new Date(this.income.date));
    });
  }

  submitIncome() {
    this.isLoading = true;
    const payload = {
      ...this.form.value,
      user: this.user,
      date: this.datepipe.transform(this.form.value.date, 'MMM dd, yyyy'),
      month: this.datepipe.transform(this.form.value.date, 'MMM, yyyy')
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
