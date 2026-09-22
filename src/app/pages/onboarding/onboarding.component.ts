import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { ROLES, PRIMARY_STACKS, INTEREST_TOPICS } from '../../core/constants/profile.constants';
import { StepperComponent } from '../../shared/components/stepper/stepper.component';
import { StepItem } from '../../shared/components/stepper/step-item.model';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterLink, StepperComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent {
  readonly roles = ROLES;
  readonly primaryStacks = PRIMARY_STACKS;
  readonly interestTopics = INTEREST_TOPICS;

  readonly steps: StepItem[] = [
    { id: 1, title: 'Role', subtitle: 'Specialization' },
    { id: 2, title: 'Primary Stacks', subtitle: 'Daily Toolkit' },
    { id: 3, title: 'Interests', subtitle: 'Curiosity Topics' },
  ];

  currentStepIndex = 0;
  selectedRole: string | null = 'Backend Developer';
  selectedStacks: Set<string> = new Set<string>();
  selectedInterests: Set<string> = new Set<string>();
  isSubmitting = false;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly toastService: ToastService
  ) { }

  get isNextDisabled(): boolean {
    if (this.currentStepIndex === 0) {
      return !this.selectedRole;
    }
    return false;
  }

  isChecklistCompleted(index: number): boolean {
    return index < this.currentStepIndex;
  }

  isChecklistActive(index: number): boolean {
    return index === this.currentStepIndex;
  }

  onStepChange(index: number): void {
    this.currentStepIndex = index;
  }

  onNext(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
    }
  }

  onBack(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
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

  toggleInterest(interest: string): void {
    if (this.selectedInterests.has(interest)) {
      this.selectedInterests.delete(interest);
    } else {
      this.selectedInterests.add(interest);
    }
  }

  isInterestSelected(interest: string): boolean {
    return this.selectedInterests.has(interest);
  }

  onFinish(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    const payload = {
      role: this.selectedRole,
      primaryStacks: Array.from(this.selectedStacks),
      interests: Array.from(this.selectedInterests)
    };

    this.userService.saveOnboardingDetail(payload).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          sessionStorage.setItem('isOnBoardingCompleted', 'true');
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
