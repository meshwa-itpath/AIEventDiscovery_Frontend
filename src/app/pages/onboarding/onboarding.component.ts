import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-onboarding',
  imports: [CommonModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent {
  roles = [
    'Developer', 'DevOps Engineer', 'Designer', 'Product manager', 'Student', 'Other'
  ];

  technologies = [
    '.NET Development', 'Java Development', 'Python Development',
    'Frontend Development', 'Database Development', 'Cloud Computing',
    'DevOps & Infrastructure', 'AI & Generative AI', 'AI Frameworks',
    'Vector Databases', 'Machine Learning', 'Data Engineering',
    'Messaging Systems', 'CI/CD', 'Monitoring & Observability',
    'Search Technologies', 'API Development'
  ];

  selectedRole: string | null = 'Developer';
  selectedTechnologies: Set<string> = new Set<string>();
  isSubmitting = false;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) { }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  toggleTech(tech: string) {
    if (this.selectedTechnologies.has(tech)) {
      this.selectedTechnologies.delete(tech);
    } else {
      this.selectedTechnologies.add(tech);
    }
  }

  isTechSelected(tech: string): boolean {
    return this.selectedTechnologies.has(tech);
  }

  onSkip() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.userService.saveOnboardingDetail({ role: null, technology: null }).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.toastService.success(response.message || 'Onboarding skipped.');
          this.router.navigate(['/search']);
        } else {
          this.toastService.error(response?.message || 'Failed to skip onboarding.');
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        console.error('Failed to skip onboarding', err);
        this.toastService.error(err?.error?.message || 'Failed to skip onboarding.');
        this.isSubmitting = false;
        this.router.navigate(['/search']);
      }
    });
  }

  onContinue() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    const payload = {
      role: this.selectedRole,
      technology: Array.from(this.selectedTechnologies)
    };

    this.userService.saveOnboardingDetail(payload).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.toastService.success(response.message || 'Onboarding completed!');
          this.router.navigate(['/search']);
        } else {
          this.toastService.error(response?.message || 'Failed to save onboarding.');
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        console.error('Failed to save onboarding', err);
        this.toastService.error(err?.error?.message || 'Failed to save onboarding.');
        this.isSubmitting = false;
        this.router.navigate(['/search']);
      }
    });
  }
}
