import { Injectable, signal } from '@angular/core';

export interface ChartThemeColors {
  text: string;
  grid: string;
  axis: string;
  palette: string[];
}

@Injectable({ providedIn: 'root' })
export class ChartThemeService {
  private isDark = signal(this.detectDarkMode());

  constructor() {
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver(() => {
        this.isDark.set(this.detectDarkMode());
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      const container = document.querySelector('.mobile-container');
      if (container) {
        observer.observe(container, { attributes: true, attributeFilter: ['class'] });
      }
    }
  }

  getColors(): ChartThemeColors {
    return this.isDark()
      ? {
          text: '#E5E7EB',
          grid: '#2c2c2e',
          axis: '#3a3a3c',
          palette: ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#FB923C'],
        }
      : {
          text: '#374151',
          grid: '#E5E7EB',
          axis: '#D1D5DB',
          palette: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'],
        };
  }

  baseOptions() {
    const theme = this.getColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: theme.text, boxWidth: 12, padding: 16 },
        },
      },
      scales: {
        x: {
          ticks: { color: theme.text, maxRotation: 0 },
          grid: { color: theme.grid, drawTicks: false },
          border: { color: theme.axis, display: true },
        },
        y: {
          ticks: { color: theme.text },
          grid: { color: theme.grid, drawTicks: false },
          border: { color: theme.axis, display: true },
        },
      },
    };
  }

  private detectDarkMode(): boolean {
    return (
      document.body.classList.contains('mobile-container--dark') ||
      document.querySelector('.mobile-container')?.classList.contains('mobile-container--dark') === true ||
      true
    );
  }
}
