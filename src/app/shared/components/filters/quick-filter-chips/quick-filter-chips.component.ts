import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DATE_RANGE_PRESETS, DateRangePreset } from '../../../enums/date-range-preset.enum';

@Component({
  selector: 'app-quick-filter-chips',
  standalone: true,
  template: `
    <div class="quick-filters">
      @for (preset of presets; track preset.value) {
        <button
          type="button"
          class="quick-filters__chip"
          [class.active]="selected === preset.value"
          (click)="selectPreset(preset.value)"
        >
          {{ preset.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .quick-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .quick-filters__chip {
        padding: 8px 14px;
        border-radius: 20px;
        border: 1px solid var(--border, #2c2c2e);
        background: var(--card, #1c1c1e);
        color: var(--text-muted, #8e8e93);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .quick-filters__chip.active {
        background: #2F7E79;
        border-color: #2F7E79;
        color: #fff;
      }
    `,
  ],
})
export class QuickFilterChipsComponent {
  @Input() selected: DateRangePreset = 'this_month';
  @Output() selectedChange = new EventEmitter<DateRangePreset>();

  presets = DATE_RANGE_PRESETS.filter((p) => p.value !== 'custom');

  selectPreset(preset: DateRangePreset): void {
    this.selected = preset;
    this.selectedChange.emit(preset);
  }
}
