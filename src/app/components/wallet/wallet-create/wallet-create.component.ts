import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { DataService } from '../../../shared/services/data.service';
import { AuthService } from '../../../shared/services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-wallet-create',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    DatePickerModule,
    SpinnerComponent,
    RadioButtonModule
  ],
  providers: [DatePipe],
  templateUrl: './wallet-create.component.html',
  styleUrl: './wallet-create.component.scss'
})
export class WalletCreateComponent {
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
      balance: ['', Validators.required],
      type: ['', Validators.required],
    })

    this.authService.getCurrentUserDetail().then(user => {
      this.user = user;
    })

    this.route.params.subscribe(params => {
      this.id = params['id'];
      // this.getExpenseDetail();
    });
  }

  getExpenseDetail() {
    // this.dataService.getExpenseDetail(this.id).then((data) => {
    //   this.income = data?.data();
    //   this.form.patchValue(this.income)
    //   this.form.get('date')?.setValue(new Date(this.income.date));
    // });
  }

  submitWallet() {
    this.isLoading = true;
    const payload = {
      ...this.form.value,
      user: this.user,
      date: this.datepipe.transform(new Date(), 'MMM dd, yyyy'),
    }
    this.dataService.saveWallet(payload, this.id).then((data) => {
      this.toastService.displayToast('success', 'Wallet', 'Wallet Saved!');
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
