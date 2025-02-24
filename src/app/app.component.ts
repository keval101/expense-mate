import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
export class AppComponent implements OnInit{
  title = 'expense-mate';
  isShowToast = false;
  toast: any = {};
  routes: string[] = ['login'];
  needSidebar = false;

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
    setTimeout(() => {
      const url = this.router.url.replaceAll('/', '');
      this.needSidebar = !this.routes.includes(url);
    }, 800);
  }

  onActivate(event: any) {
    this.needSidebar = !this.routes.includes(event.url);
  }
}
