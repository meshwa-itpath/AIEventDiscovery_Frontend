import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'app-local-search',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, IconField, InputIcon],
  templateUrl: './local-search.component.html',
  styleUrls: ['./local-search.component.css']
})
export class LocalSearchComponent {
  @Input() placeholder: string = 'Filter these results...';
  @Input() query: string = '';
  @Output() queryChange = new EventEmitter<string>();

  onQueryChange(val: string) {
    this.query = val;
    this.queryChange.emit(val);
  }

  clearSearch() {
    this.query = '';
    this.queryChange.emit('');
  }
}
