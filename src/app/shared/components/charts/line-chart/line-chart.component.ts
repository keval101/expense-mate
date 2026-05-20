import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartComponent } from '../base-chart/base-chart.component';
import { ChartThemeService } from '../chart-theme.service';
import { MonthlyBreakdown } from '../../../models/analytics.model';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [BaseChartComponent],
  template: `<app-base-chart type="line" [data]="chartData" [options]="chartOptions"></app-base-chart>`,
  host: { class: 'block w-full h-full' },
})
export class LineChartComponent implements OnChanges {
  @Input({ required: true }) labels: string[] = [];
  @Input({ required: true }) datasets: { label: string; data: number[]; color?: string; fill?: boolean }[] = [];

  chartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration['options'] = {};

  constructor(private chartTheme: ChartThemeService) {}

  ngOnChanges(): void {
    const theme = this.chartTheme.getColors();
    this.chartData = {
      labels: this.labels,
      datasets: this.datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.color ?? theme.palette[i % theme.palette.length],
        backgroundColor: ds.fill
          ? `${ds.color ?? theme.palette[i % theme.palette.length]}33`
          : undefined,
        fill: ds.fill ?? false,
        tension: 0.3,
        pointRadius: 3,
      })),
    };
    this.chartOptions = this.chartTheme.baseOptions();
  }

  static fromMonthly(data: MonthlyBreakdown[], label = 'Amount', color?: string) {
    return {
      labels: data.map((d) => d.label),
      datasets: [{ label, data: data.map((d) => d.total), color, fill: true }],
    };
  }
}
