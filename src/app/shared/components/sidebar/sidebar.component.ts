import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnDestroy {
  @ViewChild('checkbox') checkboxRef!: ElementRef<HTMLInputElement>;

  isShowSidebar = false;
  isDashboard = false;
  private destroy$ = new Subject<void>();

  constructor(
    private location: Location,
    private router: Router,
    private sidebarService: SidebarService,
    private authService: AuthService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth <= 768) {
      this.setSidebarPosition();
    } else {
      this.isShowSidebar = true;
    }
  }

  ngOnInit(): void {
    if (window.innerWidth <= 768) {
      this.setSidebarPosition();
    } else {
      this.isShowSidebar = true;
    }
    this.isDashboard = this.router.url === '/dashboard';

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isDashboard = this.router.url === '/dashboard';
    });

    this.sidebarService.onToggle.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.openSidebar();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openSidebar(): void {
    this.isShowSidebar = true;
    if (this.checkboxRef) {
      this.checkboxRef.nativeElement.checked = true;
    }
  }

  setSidebarPosition(): void {
    const mobileContainer = document.querySelector('.mobile-container') as HTMLElement;
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    if (mobileContainer && sidebar) {
      const containerRect = mobileContainer.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const sidebarWidth = containerWidth * 0.85;
      const leftPosition = containerRect.x;

      sidebar.style.width = `${sidebarWidth}px`;
      sidebar.style.left = `${leftPosition}px`;
      sidebar.style.position = 'fixed';
      sidebar.style.top = '0';
    }
  }

  hideSidebar() {
    if (window.innerWidth <= 768) {
      this.isShowSidebar = false;

      if (this.checkboxRef) {
        this.checkboxRef.nativeElement.checked = false;
      }
    }
  }

  goBack() {
    this.location.back();
  }

  logout() {
    this.hideSidebar();
    this.authService.logout();
  }
}
