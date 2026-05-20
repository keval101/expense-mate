import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    <div class="skeleton-list">
      @for (item of items; track item) {
        <div class="skeleton-card">
          <div class="skeleton-card__avatar"></div>
          <div class="skeleton-card__content">
            <div class="skeleton-line skeleton-line--wide"></div>
            <div class="skeleton-line skeleton-line--narrow"></div>
          </div>
          <div class="skeleton-line skeleton-line--amount"></div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .skeleton-list { display: flex; flex-direction: column; gap: 12px; }
      .skeleton-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--card, #1c1c1e);
        border-radius: 12px;
      }
      .skeleton-card__avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #2c2c2e;
        animation: pulse 1.5s ease-in-out infinite;
      }
      .skeleton-card__content { flex: 1; }
      .skeleton-line {
        height: 12px;
        background: #2c2c2e;
        border-radius: 4px;
        animation: pulse 1.5s ease-in-out infinite;
        margin-bottom: 8px;
      }
      .skeleton-line--wide { width: 70%; }
      .skeleton-line--narrow { width: 40%; margin-bottom: 0; }
      .skeleton-line--amount { width: 60px; height: 16px; }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
  ],
})
export class LoadingSkeletonComponent {
  @Input() count = 3;
  get items() {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
