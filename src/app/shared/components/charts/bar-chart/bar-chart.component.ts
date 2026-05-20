import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartComponent } from '../base-chart/base-chart.component';
import { ChartThemeService } from '../chart-theme.service';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [BaseChartComponent],
  template: `<app-base-chart type="bar" [data]="chartData" [options]="chartOptions"></app-base-chart>`,
  host: { class: 'block w-full h-full' },
})
export class BarChartComponent implements OnChanges {
  @Input({ required: true }) labels: string[] = [];
  @Input({ required: true }) datasets: { label: string; data: number[]; color?: string }[] = [];
  @Input() stacked = false;

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
        backgroundColor: ds.color ?? theme.palette[i % theme.palette.length],
        borderRadius: 6,
      })),
    };
    this.chartOptions = {
      ...this.chartTheme.baseOptions(),
      scales: {
        x: { ...this.chartTheme.baseOptions().scales?.['x'], stacked: this.stacked },
        y: { ...this.chartTheme.baseOptions().scales?.['y'], stacked: this.stacked },
      },
    };
  }
}
