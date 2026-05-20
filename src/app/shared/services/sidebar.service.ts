import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private toggle$ = new Subject<void>();

  readonly onToggle = this.toggle$.asObservable();

  open(): void {
    this.toggle$.next();
  }
}
