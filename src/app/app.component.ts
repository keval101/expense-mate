import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { ToastService } from './shared/services/toast.service';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SharedModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'expense-mate';
  isShowToast = false;
  toast: any = {};
  routes: string[] = ['', 'login'];
  needSidebar = false;
  private destroy$ = new Subject<void>();

  constructor(
    private toastService: ToastService,
    private router: Router
  ) {
    this.toastService.toast$.subscribe((data: any) => {
      if(data.message) {
        this.isShowToast = true;
        this.toast = data;
      }
      setTimeout(() => {
        this.isShowToast = false;
      }, 3000);
    })
  }

  ngOnInit(): void {
    this.updateRouteState();
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updateRouteState());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onActivate(): void {
    this.updateRouteState();
  }

  private updateRouteState(): void {
    const url = this.router.url.replaceAll('/', '');
    this.needSidebar = !this.routes.includes(url);
  }
}
