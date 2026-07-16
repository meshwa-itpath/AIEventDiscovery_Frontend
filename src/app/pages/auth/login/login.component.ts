import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  protected readonly loginForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Flag to track form submission attempts
  protected isSubmitted = false;

  // Handle form submission
  protected onSubmit(): void {
    this.isSubmitted = true;

    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      
      this.authService.login(loginData).subscribe({
        next: (response) => {
          // Assuming the token is returned in response.token
          if (response && response.token) {
            sessionStorage.setItem('token', response.token);
          }
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Login failed', error);
          // Handle error (e.g., show message)
        }
      });
    }
  }

  // Helper method to check if a form control is invalid and dirty/touched
  protected isControlInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.isSubmitted));
  }
}

