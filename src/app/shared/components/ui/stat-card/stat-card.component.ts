import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="stat-card" [class]="variant">
      <p class="stat-card__label">{{ label }}</p>
      <p class="stat-card__value">
        @if (loading) {
          <span class="stat-card__skeleton"></span>
        } @else if (isCurrency) {
          {{ value | currency: 'INR' }}
        } @else if (isPercent) {
          {{ value }}%
        } @else {
          {{ value }}
        }
      </p>
      @if (subtitle) {
        <p class="stat-card__subtitle">{{ subtitle }}</p>
      }
    </div>
  `,
  styles: [
    `
      .stat-card {
        background: var(--card, #1c1c1e);
        border: 1px solid var(--border, #2c2c2e);
        border-radius: 16px;
        padding: 16px;
        min-height: 90px;
      }
      .stat-card__label {
        font-size: 12px;
        color: var(--text-muted, #8e8e93);
        margin-bottom: 8px;
      }
      .stat-card__value {
        font-size: 20px;
        font-weight: 600;
        color: var(--text, #fff);
      }
      .stat-card__subtitle {
        font-size: 11px;
        color: var(--text-muted, #8e8e93);
        margin-top: 4px;
      }
      .stat-card.income .stat-card__value { color: #30d158; }
      .stat-card.expense .stat-card__value { color: #ff453a; }
      .stat-card.savings .stat-card__value { color: #3B82F6; }
      .stat-card.balance .stat-card__value { color: #FBBF24; }
      .stat-card__skeleton {
        display: inline-block;
        width: 80px;
        height: 20px;
        background: linear-gradient(90deg, #2c2c2e 25%, #3a3a3c 50%, #2c2c2e 75%);
        background-size: 200% 100%;
        animation: shimmer 1.2s infinite;
        border-radius: 4px;
      }
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `,
  ],
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value: number | string = 0;
  @Input() subtitle?: string;
  @Input() variant: 'default' | 'income' | 'expense' | 'savings' | 'balance' = 'default';
  @Input() isCurrency = true;
  @Input() isPercent = false;
  @Input() loading = false;
}
