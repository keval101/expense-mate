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
      console.log(data);
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
      console.log(this.router.url)
      const url = this.router.url.replaceAll('/', '');
      this.needSidebar = !this.routes.includes(url);
    }, 500);
  }

  onActivate(event: any) {
    console.log(event)
    this.needSidebar = !this.routes.includes(event.url);
  }
}
