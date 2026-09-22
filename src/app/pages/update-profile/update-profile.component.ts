import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { UpdateProfileRequest } from '../../core/models/user-profile.model';
import { ROLES, PRIMARY_STACKS, INTEREST_TOPICS } from '../../core/constants/profile.constants';

@Component({
  selector: 'app-update-profile',
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule],
  templateUrl: './update-profile.component.html',
  styleUrl: './update-profile.component.css',
})
export class UpdateProfileComponent implements OnInit {
  readonly roles = ROLES;
  readonly primaryStacks = PRIMARY_STACKS;
  readonly interestTopics = INTEREST_TOPICS;

  firstName = '';
  lastName = '';
  email = '';
  selectedRole: string | null = null;
  selectedStacks: Set<string> = new Set<string>();
  selectedInterests: Set<string> = new Set<string>();

  isLoading = true;
  isSubmitting = false;
  loadError = false;

  /** Decodes the JWT from sessionStorage and returns the email claim. */
  private getEmailFromToken(): string {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return '';
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      // Standard JWT claim for email
      return decoded?.email
        || decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
        || decoded?.sub
        || '';
    } catch {
      return '';
    }
  }

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  get userInitials(): string {
    const f = this.firstName?.charAt(0)?.toUpperCase() || '';
    const l = this.lastName?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  }

  loadProfile(): void {
    this.isLoading = true;
    this.loadError = false;
    this.userService.getProfile().subscribe({
      next: (response: any) => {
        if (!response?.success) {
          this.toastService.error(response?.message || 'Failed to load profile.');
          this.isLoading = false;
          this.loadError = true;
          return;
        }
        const data = response.data;
        this.firstName = data?.firstName || '';
        this.lastName = data?.lastName || '';
        this.email = this.getEmailFromToken();
        this.selectedRole = data?.role || null;

        const stacks: string[] = data?.primaryStacks || [];
        const interests: string[] = data?.interests || [];

        // If primaryStacks/interests are populated, use them
        if (stacks.length > 0 || interests.length > 0) {
          this.selectedStacks = new Set<string>(stacks);
          this.selectedInterests = new Set<string>(interests);
        } else if (data?.technology && Array.isArray(data.technology)) {
          // Fallback if legacy technology array was returned
          const techList: string[] = data.technology;
          const stackSet = new Set(this.primaryStacks);
          const sSet = new Set<string>();
          const iSet = new Set<string>();
          for (const t of techList) {
            if (stackSet.has(t)) {
              sSet.add(t);
            } else {
              iSet.add(t);
            }
          }
          this.selectedStacks = sSet;
          this.selectedInterests = iSet;
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.toastService.error(err?.error?.message || 'Failed to load profile.');
        this.isLoading = false;
        this.loadError = true;
      }
    });
  }

  selectRole(role: string): void {
    this.selectedRole = role;
  }

  toggleStack(stack: string): void {
    if (this.selectedStacks.has(stack)) {
      this.selectedStacks.delete(stack);
    } else {
      this.selectedStacks.add(stack);
    }
  }

  isStackSelected(stack: string): boolean {
    return this.selectedStacks.has(stack);
  }

  toggleInterest(topic: string): void {
    if (this.selectedInterests.has(topic)) {
      this.selectedInterests.delete(topic);
    } else {
      this.selectedInterests.add(topic);
    }
  }

  isInterestSelected(topic: string): boolean {
    return this.selectedInterests.has(topic);
  }

  onCancel(): void {
    this.router.navigate(['/search']);
  }

  onSave(): void {
    if (this.isSubmitting) return;
    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.toastService.warn('Please enter your first and last name.');
      return;
    }

    this.isSubmitting = true;
    const payload: UpdateProfileRequest = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      role: this.selectedRole,
      primaryStacks: Array.from(this.selectedStacks),
      interests: Array.from(this.selectedInterests)
    };

    this.userService.updateProfile(payload).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.toastService.success(response.message || 'Profile updated successfully!');
          this.router.navigate(['/search']);
        } else {
          this.toastService.error(response?.message || 'Failed to update profile.');
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        this.toastService.error(err?.error?.message || 'Failed to update profile.');
        this.isSubmitting = false;
      }
    });
  }
}
