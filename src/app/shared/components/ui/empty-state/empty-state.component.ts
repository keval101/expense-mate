import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <i [class]="icon"></i>
      <p class="empty-state__title">{{ title }}</p>
      @if (message) {
        <p class="empty-state__message">{{ message }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .empty-state {
        text-align: center;
        padding: 48px 24px;
        color: var(--text-muted, #8e8e93);
      }
      .empty-state i {
        font-size: 48px;
        margin-bottom: 16px;
        display: block;
        opacity: 0.5;
      }
      .empty-state__title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text, #fff);
        margin-bottom: 8px;
      }
      .empty-state__message {
        font-size: 13px;
        line-height: 1.5;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = 'ri-inbox-line';
  @Input({ required: true }) title!: string;
  @Input() message?: string;
}
