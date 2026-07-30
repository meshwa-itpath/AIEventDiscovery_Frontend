import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  // Initialize registration form with controls matching backend properties:
  // FirstName, LastName, Email, Password
  protected signupForm!: FormGroup;

  // Track submission state
  protected isSubmitted = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // Handle registration request
  protected onSubmit(): void {
    this.isSubmitted = true;

    if (this.signupForm.valid) {
      const registrationPayload = {
        firstName: this.signupForm.value.firstName,
        lastName: this.signupForm.value.lastName,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password
      };
      
      this.authService.register(registrationPayload).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.toastService.success(response.message || 'Registered successfully! Please log in.');
            this.router.navigate(['/auth/login']);
          } else {
            this.toastService.error(response?.message || 'Registration failed. Please try again.');
          }
        },
        error: (error) => {
          console.error('Registration failed', error);
          this.toastService.error(error?.error?.message || 'Registration failed. Please try again.');
        }
      });
    }
  }

  // Check if form control should display validation error state
  protected isControlInvalid(controlName: string): boolean {
    const control = this.signupForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.isSubmitted));
  }
}

