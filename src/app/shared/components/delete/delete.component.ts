import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete',
  imports: [],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {

  @Input() name: any;
  @Output() onDelete = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setDrawerPosition();
  }

  ngOnInit(): void {
    this.setDrawerPosition();
  }

  setDrawerPosition(): void {
    setTimeout(() => {
      const mobileContainer = document.querySelector('.mobile-container') as HTMLElement;
      const sidebar = document.querySelector('.delete-container') as HTMLElement;
      if (mobileContainer && sidebar) {
        const containerRect = mobileContainer.getBoundingClientRect(); // Get position relative to viewport
        const containerWidth = containerRect.width;
        const sidebarWidth = containerWidth; // Sidebar is 85% of mobile-container
        const leftPosition = containerRect.x; // Calculate actual left position

        sidebar.style.left = `${leftPosition}px`;
        sidebar.style.width = `${sidebarWidth}px`; 
      }
    }, 0);
  }
}
