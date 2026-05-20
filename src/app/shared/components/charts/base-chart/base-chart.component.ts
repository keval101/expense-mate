import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  afterNextRender,
} from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-base-chart',
  standalone: true,
  template: `<div class="chart-container"><canvas #canvas></canvas></div>`,
  styles: [
    `
      .chart-container {
        position: relative;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class BaseChartComponent implements OnChanges, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) type!: ChartType;
  @Input({ required: true }) data!: ChartConfiguration['data'];
  @Input() options: ChartConfiguration['options'] = {};

  private chart?: Chart;

  constructor() {
    afterNextRender(() => this.renderChart());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['data'] || changes['options'] || changes['type'])) {
      this.chart.data = this.data;
      if (this.options) {
        this.chart.options = this.options;
      }
      this.chart.update();
    } else if (!this.chart && this.data) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    if (!this.canvasRef?.nativeElement || !this.data) return;

    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: this.type,
      data: this.data,
      options: this.options,
    });
  }
}
