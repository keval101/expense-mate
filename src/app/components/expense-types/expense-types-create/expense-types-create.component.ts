import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../../shared/services/data.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-expense-types-create',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './expense-types-create.component.html',
  styleUrl: './expense-types-create.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ExpenseTypesCreateComponent implements OnInit{
  form!: FormGroup;
  isLoading = false;
  user: any;

   constructor(
      private fb: FormBuilder,
      private dataService: DataService,
      private authService: AuthService,
      private router: Router,
      private toastService: ToastService
    ) {
    }
  
    ngOnInit(): void {
      this.authService.getCurrentUserDetail().then(user => {
        this.user = user;
      })
        this.form = this.fb.group({
          name: ['', Validators.required],
        })
    }

    async saveExpenseType() {
      const payload = {
        name: this.form.value.name,
        userId: this.user.id,
        delete: true,
        type: this.form.value.name.toLowerCase().replace(' ', '-')
      }

      await this.dataService.saveExpenseType(payload);
      this.toastService.displayToast('success', 'Expense Type', 'Expense Type Added Successfully');
      setTimeout(() => {
        this.router.navigate(['/expense-types'])
      }, 1000);
    }
}
