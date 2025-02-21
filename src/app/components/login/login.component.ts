import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../shared/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    SharedModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  isGetStarted = false;
  isPasswordSeen = false;
  isLogin = false;
  isLoading = false;
  emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
  form!: FormGroup;

  constructor(
    private toastService: ToastService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.authService.logout();
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', Validators.required]
    });
  }

  getStarted() {
    this.isGetStarted = true
  }

  onLoginAction() {
    this.isLogin = !this.isLogin;
    this.isGetStarted = true;

    if (this.isLogin) {
      this.form.controls['first_name'].setValidators(null);
      this.form.controls['last_name'].setValidators(null);
      this.form.controls['phone'].setValidators(null);
    } else {
      this.form.controls['first_name'].setValidators([Validators.required]);
      this.form.controls['last_name'].setValidators([Validators.required]);
      this.form.controls['phone'].setValidators([Validators.required]);
    }

    this.form.controls['first_name'].updateValueAndValidity();
    this.form.controls['last_name'].updateValueAndValidity();
    this.form.controls['phone'].updateValueAndValidity();

  }

  submit() {
    if (this.form.valid) {
      const payload = this.form.value;
      this.isLoading = true;

      if (this.isLogin) {
        this.authService.login(this.form.value.email, this.form.value.password).then((res: any) => {
          this.isLoading = false;
          localStorage.setItem('userId', res.user.uid);
          this.toastService.displayToast('success', 'Sign In', 'Sign In successfully!');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        }).catch(error => {
          this.isLoading = false;
          let errorMessage = 'Something went wrong!';
          if (error.message.includes('invalid-credential')) {
            errorMessage = 'Invalid email or password!'
          }
          this.toastService.displayToast('error', 'Sign In', errorMessage);
        });
      } else {
        this.authService.register(this.form.value.email, this.form.value.password).then(async (res: any) => {
          this.isLoading = false;
          payload['id'] = res.user.uid;
          await this.authService.storeUserData(payload); // Wait for data storage
          this.toastService.displayToast('success', 'Sign Up', 'Sign Up successfully!');
        }).catch(error => {
          this.isLoading = false;
          let errorMessage = 'Something went wrong!';
          if (error.message.includes('email')) {
            errorMessage = 'Email already exists!'
          }

          this.toastService.displayToast('error', 'Sign Up', errorMessage);
        });
      }
    }
  }
}
