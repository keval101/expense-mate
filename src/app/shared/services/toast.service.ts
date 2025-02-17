import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  public toast$ = new BehaviorSubject<any>({});

  constructor() { }

  displayToast(type: string, message: string, subText: string) {
    console.log(message, type, subText)
    this.toast$.next({ message, type, subText });
  }
}
