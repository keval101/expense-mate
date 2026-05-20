import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

export interface CategoryOption {
  id: string;
  name: string;
  slug?: string;
}

@Component({
  selector: 'app-category-multi-select',
  standalone: true,
  imports: [FormsModule, MultiSelectModule],
  template: `
    <div class="category-select">
      <label>Categories</label>
      <p-multiselect
        [options]="categories"
        [(ngModel)]="selectedIds"
        (ngModelChange)="onChange()"
        optionLabel="name"
        optionValue="id"
        placeholder="All categories"
        [showToggleAll]="true"
        styleClass="w-full"
        display="chip"
      />
    </div>
  `,
  styles: [
    `
      .category-select label {
        display: block;
        font-size: 12px;
        color: var(--text-muted, #8e8e93);
        margin-bottom: 6px;
      }
    `,
  ],
})
export class CategoryMultiSelectComponent {
  @Input() categories: CategoryOption[] = [];
  @Input() selectedIds: string[] = [];
  @Output() selectedIdsChange = new EventEmitter<string[]>();

  onChange(): void {
    this.selectedIdsChange.emit(this.selectedIds);
  }
}
