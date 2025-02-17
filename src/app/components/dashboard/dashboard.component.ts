import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { TransactionsHistoryComponent } from '../transactions-history/transactions-history.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    TransactionsHistoryComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {


  greeting: string = '';
  name: string = '';

  user: any;
  constructor(
    private authService: AuthService
  ) {
    this.greeting = this.getGreeting();

    this.authService.getCurrentUserDetail().then((user) => {
      this.user = user;
      this.name = this.user.first_name + ' ' + this.user.last_name;
      console.log(this.user);
    });
  }

  getGreeting() {
    const hours = new Date().getHours();
    let greeting;

    if (hours < 12) {
        greeting = "Good morning";
    } else if (hours < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }

    return `${greeting}`;
}
}
