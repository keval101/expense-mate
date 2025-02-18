import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { Subject, takeUntil } from 'rxjs';
import { DataService } from '../../../shared/services/data.service';
import { AuthService } from '../../../shared/services/auth.service';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-transactions-filter',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    CheckboxModule,
    MultiSelectModule
  ],
  providers: [DatePipe],
  templateUrl: './transactions-filter.component.html',
  styleUrl: './transactions-filter.component.scss'
})
export class TransactionsFilterComponent implements OnInit{

  @Input() data: any = {};
  @Output() close = new EventEmitter();
  @Output() onFilterEmit = new EventEmitter();
  @Output() onClearFilterEmit = new EventEmitter();
  form!: FormGroup;
  expenseTypes: any[] = [];
  months: any[] = [];
  user: any;
  destroy$ = new Subject<void>();

  constructor(
    private datepipe: DatePipe,
    private fb: FormBuilder,
    private dataService: DataService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      topSpending: ['', ],
      type: ['', ],
      month: ['', ],
    })

    this.months = ['Jan, 2025', 'Feb, 2025', 'Mar, 2025', 'Apr, 2025', 'May, 2025', 'Jun, 2025', 'Jul, 2025', 'Aug, 2025', 'Sep, 2025', 'Oct, 2025', 'Nov, 2025', 'Dec, 2025'];
    this.authService.getCurrentUserDetail().then(user => {
      this.user = user;
      this.getExpenseTypes(this.user.id);
    })
  }

  ngOnChanges() {
    this.form.patchValue(this.data);
  }

  ngOnInit(): void {
    this.form.patchValue(this.data);
  }

  getExpenseTypes(userId: string) {
    this.dataService.getExpenseTypes(userId).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.expenseTypes = data;
    });
  }

  onFilter() {
    this.onFilterEmit.emit(this.form.value);
    this.close.emit(true);
  }

  clearAll() {
    this.form.reset();
    this.onClearFilterEmit.emit();
    this.close.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
