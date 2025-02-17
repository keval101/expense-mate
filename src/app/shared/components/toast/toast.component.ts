import { Component, Input } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  message: string = '';
  type: string = '';
  subText: string = '';
  isShowToast = false;

  
  constructor(private toastService: ToastService) {

  }

  ngOnInit(): void {
    this.toastService.toast$.subscribe((data: any) => {
      if(data.message) {
        this.isShowToast = true;
        this.message = data.message;
        this.type = data.type;
        this.subText = data.subText;
      }
      setTimeout(() => {
        this.isShowToast = false;
      }, 3000);
    })
  }
}
