import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-splash',
  imports: [
    RouterModule
  ],
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.scss'
})
export class SplashComponent {

  constructor(private router: Router) { 
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}
