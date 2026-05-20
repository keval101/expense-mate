import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartComponent } from '../base-chart/base-chart.component';
import { ChartThemeService } from '../chart-theme.service';

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [BaseChartComponent],
  template: `<app-base-chart type="doughnut" [data]="chartData" [options]="chartOptions"></app-base-chart>`,
  host: { class: 'block w-full h-full' },
})
export class DoughnutChartComponent implements OnChanges {
  @Input({ required: true }) labels: string[] = [];
  @Input({ required: true }) data: number[] = [];

  chartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration['options'] = {};

  constructor(private chartTheme: ChartThemeService) {}

  ngOnChanges(): void {
    const theme = this.chartTheme.getColors();
    this.chartData = {
      labels: this.labels,
      datasets: [
        {
          data: this.data,
          backgroundColor: this.labels.map((_, i) => theme.palette[i % theme.palette.length]),
          borderWidth: 0,
        },
      ],
    };
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: theme.text, boxWidth: 12, padding: 12 },
        },
      },
    };
  }
}
