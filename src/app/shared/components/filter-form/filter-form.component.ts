import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { DividerModule } from 'primeng/divider';
import { DatePickerModule } from 'primeng/datepicker';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-filter-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CheckboxModule,
    RadioButtonModule,
    MultiSelectModule,
    DividerModule,
    DatePickerModule,
    SliderModule,
    InputTextModule,
    ButtonModule,
    ChipModule
  ],
  templateUrl: './filter-form.component.html',
  styleUrl: './filter-form.component.css'
})
export class FilterFormComponent {
  private fb = inject(FormBuilder);

  filterForm: FormGroup = this.fb.group({
    level: this.fb.control([]),
    mode: this.fb.control([]),
    category: this.fb.control([]),
    eventType: this.fb.control([]),
    city: [''],
    country: [''],
    startDate: [null],
    endDate: [null],
    technologies: this.fb.control([]),
    rating: [0]
  });

  @Output() filtersApplied = new EventEmitter<any>();

  get currentRating(): number {
    return this.filterForm.get('rating')?.value || 0;
  }

  applyFilters() {
    this.filtersApplied.emit(this.filterForm.value);
  }

  triggerReset() {
    this.resetForm();
    this.filtersApplied.emit(null);
  }

  resetForm() {
    this.filterForm.reset({ rating: 0 });
  }

  techOptions = [
    { label: '.NET', value: '.NET' },
    { label: 'Java', value: 'Java' },
    { label: 'Python', value: 'Python' },
    { label: 'React', value: 'React' },
    { label: 'Angular', value: 'Angular' },
    { label: 'Node.js', value: 'Node.js' }
  ];
}
