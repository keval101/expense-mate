import { Component, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service';
import { SavingsService } from '../../../shared/services/savings.service';
import { Savings, SavingsType } from '../../../shared/models/savings.model';
import { SAVINGS_TYPE_CONFIG, SAVINGS_TYPES } from '../../../shared/enums/savings-type.enum';
import { SharedModule } from '../../../shared/shared.module';
import { EmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/ui/loading-skeleton/loading-skeleton.component';
import { DeleteComponent } from '../../../shared/components/delete/delete.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-savings-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    CurrencyPipe,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    DeleteComponent,
  ],
  templateUrl: './savings-list.component.html',
  styleUrl: './savings-list.component.scss',
})
export class SavingsListComponent implements OnDestroy {
  user: any;
  savings: Savings[] = [];
  filteredSavings: Savings[] = [];
  isLoading = true;
  selectedType: SavingsType | 'all' = 'all';
  selectedItem: Savings | null = null;
  typeConfig = SAVINGS_TYPE_CONFIG;
  typeFilters: (SavingsType | 'all')[] = ['all', ...SAVINGS_TYPES];
  destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private savingsService: SavingsService,
    private toastService: ToastService
  ) {
    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      this.loadSavings();
    });
  }

  loadSavings(): void {
    this.isLoading = true;
    this.savingsService
      .getSavings(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.savings = items;
          this.applyFilter();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.toastService.displayToast('error', 'Error', 'Failed to load savings');
        },
      });
  }

  setTypeFilter(type: SavingsType | 'all'): void {
    this.selectedType = type;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredSavings =
      this.selectedType === 'all'
        ? this.savings
        : this.savings.filter((s) => s.type === this.selectedType);
  }

  getTotalSaved(): number {
    return this.filteredSavings.reduce((sum, s) => sum + s.amount, 0);
  }

  setSelectedItem(item: Savings, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectedItem = item;
  }

  onCancelDelete(): void {
    this.selectedItem = null;
  }

  async deleteSavings(): Promise<void> {
    if (!this.selectedItem) return;
    try {
      await this.savingsService.deleteSavings(this.user.id, this.selectedItem);
      this.toastService.displayToast('success', 'Savings', 'Savings entry deleted');
      this.selectedItem = null;
    } catch {
      this.toastService.displayToast('error', 'Error', 'Failed to delete savings');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
