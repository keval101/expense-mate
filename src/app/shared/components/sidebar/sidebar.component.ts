import { Location } from '@angular/common';
import { Component, ElementRef, Host, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
  isDashboard = false;

  constructor(
    private location: Location,
    private router: Router
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if(window.innerWidth < 600) {
      this.setSidebarPosition();
    } else {
      this.isShowSidebar = true;
    }
  }

  ngOnInit(): void {
      if(window.innerWidth < 600) {
        this.setSidebarPosition();
      } else {
        this.isShowSidebar = true;
      }
      this.isDashboard = this.router.url === '/dashboard';

      this.router.events.subscribe(event => {
        this.isDashboard = this.router.url === '/dashboard';
      })
  }

  setSidebarPosition(): void { 
    const mobileContainer = document.querySelector('.mobile-container') as HTMLElement;
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    if (mobileContainer && sidebar) {
      const containerRect = mobileContainer.getBoundingClientRect(); // Get position relative to viewport
      const containerWidth = containerRect.width;
      const sidebarWidth = containerWidth * 0.85; // Sidebar is 85% of mobile-container
      const leftPosition = containerRect.x; // Calculate actual left position


      sidebar.style.width = `${sidebarWidth}px`;
      sidebar.style.left = `${leftPosition}px`;
      sidebar.style.position = "fixed"; // Fix position relative to viewport
      sidebar.style.top = "0"; // Keep it at the top (adjust as needed)
    }
  }

  hideSidebar() {
    if(window.innerWidth < 600) {
      this.isShowSidebar = false;

      if (this.checkboxRef) {
        this.checkboxRef.nativeElement.checked = false;
      }
    }
  }

  goBack() {
    this.location.back();
  }
}
