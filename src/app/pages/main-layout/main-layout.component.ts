import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { SearchStateService } from '../../core/services/search-state.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  private router = inject(Router);
  private searchState = inject(SearchStateService);
  private draftSearchQuery = signal<string>(this.searchState.searchQuery());

  constructor() {
    effect(() => {
      const submittedQuery = this.searchState.searchQuery();
      if (submittedQuery !== this.draftSearchQuery()) {
        this.draftSearchQuery.set(submittedQuery);
      }
    });
  }

  get searchQuery(): string {
    return this.searchState.searchQuery();
  }
  set searchQuery(value: string) {
    this.draftSearchQuery.set(value);
    this.searchState.searchQuery.set(value);
  }

  get searchInputValue(): string {
    return this.draftSearchQuery();
  }
  set searchInputValue(value: string) {
    this.draftSearchQuery.set(value);
    this.searchState.searchQuery.set(value);
  }

  get isSearching(): boolean {
    return this.searchState.isSearching();
  }

  isSearchPage(): boolean {
    return this.router.url.startsWith('/search');
  }

  isDetailPage(): boolean {
    return this.router.url.startsWith('/events/');
  }

  searchEvents(): void {
    const query = this.draftSearchQuery().trim();
    this.searchState.executeSearch(query);
    this.router.navigate(['/search']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }

  goHome(): void {
    this.draftSearchQuery.set('');
    this.searchState.clearSearch();
    this.router.navigate(['/search']);
  }

  onSearchInputChanged(value: string): void {
    this.draftSearchQuery.set(value);
    this.searchState.searchQuery.set(value);
  }

  clearSearchInput(): void {
    this.draftSearchQuery.set('');
    this.searchState.clearSearch();
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}
