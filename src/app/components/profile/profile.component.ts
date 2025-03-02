import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent {
  user: any;
  loading = false;
  constructor(private authService: AuthService) {
    this.authService.getCurrentUserDetail().then(user => this.user = user);
  }
}
