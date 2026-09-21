import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepItem } from './step-item.model';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css'
})
export class StepperComponent {
  @Input() steps: StepItem[] = [];
  @Input() currentStepIndex = 0;
  @Input() isNextDisabled = false;
  @Input() isSubmitting = false;
  @Input() nextButtonText = 'Next Step';
  @Input() finishButtonText = 'Complete Discovery';
  @Input() allowDirectJump = true;

  @Output() stepChange = new EventEmitter<number>();
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() finish = new EventEmitter<void>();

  get isLastStep(): boolean {
    return this.steps.length > 0 && this.currentStepIndex === this.steps.length - 1;
  }

  get progressPercentage(): number {
    if (!this.steps || this.steps.length <= 1 || this.currentStepIndex === 0) return 0;
    if (this.steps.length === 3) {
      return this.currentStepIndex === 1 ? 44 : 90;
    }
    return Math.min(90, (this.currentStepIndex / (this.steps.length - 1)) * 90);
  }

  isStepCompleted(index: number): boolean {
    return index < this.currentStepIndex;
  }

  isStepActive(index: number): boolean {
    return index === this.currentStepIndex;
  }

  goToStep(index: number): void {
    if (!this.allowDirectJump || this.isSubmitting) return;
    // Allow clicking on completed steps or current step
    if (this.isStepCompleted(index) && index !== this.currentStepIndex) {
      this.stepChange.emit(index);
    }
  }

  onNext(): void {
    if (this.isNextDisabled || this.isSubmitting) return;
    if (this.isLastStep) {
      this.finish.emit();
    } else {
      this.next.emit();
    }
  }

  onBack(): void {
    if (this.currentStepIndex <= 0 || this.isSubmitting) return;
    this.back.emit();
  }
}
