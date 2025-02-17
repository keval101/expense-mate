import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DataService } from '../../../shared/services/data.service';

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

  constructor(
    private fb: FormBuilder,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
      this.form = this.fb.group({
        name: ['', Validators.required],
        type: ['', Validators.required],
        amount: ['', Validators.required],
        date: ['', Validators.required]
      })

      this.getExpenseTypes();
  }

  getExpenseTypes() {
    this.isLoading = true;
    this.dataService.getExpenseTypes().subscribe((data) => {
      this.expenseTypes = data;
      this.isLoading = false;
      console.log(this.expenseTypes);
    });
  }

}
