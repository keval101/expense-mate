import { Component, Input } from '@angular/core';
import { Insight } from '../../../models/analytics.model';

@Component({
  selector: 'app-insight-banner',
  standalone: true,
  template: `
    <div class="insight-banner" [class]="insight.type">
      <i [class]="getIcon(insight.type)"></i>
      <span>{{ insight.message }}</span>
    </div>
  `,
  styles: [
    `
      .insight-banner {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.4;
      }
      .insight-banner i { font-size: 18px; flex-shrink: 0; }
      .insight-banner.success {
        background: rgba(48, 209, 88, 0.12);
        color: #30d158;
        border: 1px solid rgba(48, 209, 88, 0.25);
      }
      .insight-banner.warning {
        background: rgba(255, 69, 58, 0.12);
        color: #ff453a;
        border: 1px solid rgba(255, 69, 58, 0.25);
      }
      .insight-banner.info {
        background: rgba(59, 130, 246, 0.12);
        color: #60A5FA;
        border: 1px solid rgba(59, 130, 246, 0.25);
      }
    `,
  ],
})
export class InsightBannerComponent {
  @Input({ required: true }) insight!: Insight;

  getIcon(type: Insight['type']): string {
    switch (type) {
      case 'success': return 'ri-checkbox-circle-line';
      case 'warning': return 'ri-error-warning-line';
      default: return 'ri-information-line';
    }
  }
}
