import { Component, ElementRef, Host, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    FormsModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @ViewChild('checkbox') checkboxRef!: ElementRef<HTMLInputElement>;

  isShowSidebar = false;
  constructor() { }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    console.log('resize', event)
    this.setSidebarPosition();
  }

  ngOnInit(): void {
      this.setSidebarPosition();
  }

  setSidebarPosition(): void { 
    const mobileContainer = document.querySelector('.mobile-container') as HTMLElement;
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    console.log('container:', sidebar, mobileContainer)
    if (mobileContainer && sidebar) {
      const containerRect = mobileContainer.getBoundingClientRect(); // Get position relative to viewport
      const containerWidth = containerRect.width;
      const sidebarWidth = containerWidth * 0.85; // Sidebar is 85% of mobile-container
      const leftPosition = containerRect.x; // Calculate actual left position

      console.log('containerRect', containerRect, containerWidth, sidebarWidth, leftPosition)

      sidebar.style.width = `${sidebarWidth}px`;
      sidebar.style.left = `${leftPosition}px`;
      sidebar.style.position = "fixed"; // Fix position relative to viewport
      sidebar.style.top = "0"; // Keep it at the top (adjust as needed)
    }
  }

  hideSidebar() {
    this.isShowSidebar = false;
    if (this.checkboxRef) {
      this.checkboxRef.nativeElement.checked = false;
    }
  }
}
