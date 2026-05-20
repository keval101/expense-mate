import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { DateRangePreset } from '../../../enums/date-range-preset.enum';

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [FormsModule, DatePickerModule],
  template: `
    @if (preset === 'custom') {
      <div class="date-range-filter">
        <div class="date-range-filter__field">
          <label>From</label>
          <p-datepicker
            [(ngModel)]="fromDate"
            (ngModelChange)="emitChange()"
            dateFormat="M dd, yy"
            [showIcon]="true"
            styleClass="w-full"
          />
        </div>
        <div class="date-range-filter__field">
          <label>To</label>
          <p-datepicker
            [(ngModel)]="toDate"
            (ngModelChange)="emitChange()"
            dateFormat="M dd, yy"
            [showIcon]="true"
            styleClass="w-full"
          />
        </div>
      </div>
    }
  `,
  styles: [
    `
      .date-range-filter {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-top: 12px;
      }
      .date-range-filter__field label {
        display: block;
        font-size: 12px;
        color: var(--text-muted, #8e8e93);
        margin-bottom: 6px;
      }
    `,
  ],
})
export class DateRangeFilterComponent {
  @Input() preset: DateRangePreset = 'this_month';
  @Input() fromDate?: Date;
  @Input() toDate?: Date;
  @Output() rangeChange = new EventEmitter<{ fromDate?: Date; toDate?: Date }>();

  emitChange(): void {
    this.rangeChange.emit({ fromDate: this.fromDate, toDate: this.toDate });
  }
}
