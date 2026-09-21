import { Component, inject, signal, ViewChild, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecommendedEventsComponent } from '../recommended-events/recommended-events.component';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { EventService } from '../../core/services/event.service';
import { RecommendedEvent } from '../../core/models/recommended-event.model';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';
import { DrawerModule } from 'primeng/drawer';
import { FilterFormComponent } from '../../shared/components/filter-form/filter-form.component';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    FormsModule,
    RecommendedEventsComponent,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SkeletonModule,
    EventCardComponent,
    DrawerModule,
    FilterFormComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  private router = inject(Router);
  private eventService = inject(EventService);

  searchQuery: string = '';

  filterDrawerVisible = signal(false);

  allFetchedEvents = signal<RecommendedEvent[] | null>(null);
  searchResults = signal<RecommendedEvent[] | null>(null);
  activeFilters = signal<any>(null);
  hasActiveFilters = computed(() => !!this.activeFilters());

  isSearching = signal(false);
  isLoadingMore = signal(false);
  hasMore = signal(false);

  private readonly pageSize = 20;
  private currentPage = 1;

  @ViewChild(FilterFormComponent) filterFormComponent!: FilterFormComponent;

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  /** Fresh search — resets to page 1 */
  searchEvents(): void {
    if (!this.searchQuery.trim()) {
      this.allFetchedEvents.set(null);
      this.searchResults.set(null);
      return;
    }

    this.isSearching.set(true);
    this.currentPage = 1;

    this.eventService.searchEvents(this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success) {
          this.allFetchedEvents.set(response.data);
          this.filterEvents();
          if (response.pagination) {
            this.hasMore.set(response.pagination.hasNextPage);
          } else {
            this.hasMore.set(response.data.length === this.pageSize);
          }
        } else {
          this.allFetchedEvents.set([]);
          this.searchResults.set([]);
          this.hasMore.set(false);
        }
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Error searching events', err);
        this.isSearching.set(false);
        this.allFetchedEvents.set([]);
        this.searchResults.set([]);
        this.hasMore.set(false);
      }
    });
  }

  /** Load next page and append to existing results */
  loadMoreResults(): void {
    if (this.isLoadingMore() || !this.hasMore()) return;
    this.isLoadingMore.set(true);
    this.currentPage++;

    this.eventService.searchEvents(this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.allFetchedEvents.update((prev) => [...(prev ?? []), ...response.data]);
          this.filterEvents();
          if (response.pagination) {
            this.hasMore.set(response.pagination.hasNextPage);
          } else {
            this.hasMore.set(response.data.length === this.pageSize);
          }
        } else {
          this.hasMore.set(false);
          this.currentPage--;
        }
        this.isLoadingMore.set(false);
      },
      error: (err) => {
        console.error('Error loading more search results', err);
        this.isLoadingMore.set(false);
        this.currentPage--;
      }
    });
  }

  onFiltersApplied(filters: any): void {
    this.activeFilters.set(filters);
    this.filterEvents();
    this.filterDrawerVisible.set(false);
  }

  clearFilters(): void {
    this.activeFilters.set(null);
    if (this.filterFormComponent) {
      this.filterFormComponent.resetForm();
    }
    this.filterEvents();
  }

  private filterEvents(): void {
    const all = this.allFetchedEvents();
    if (!all) {
      this.searchResults.set(null);
      return;
    }

    const filters = this.activeFilters();
    if (!filters) {
      this.searchResults.set([...all]);
      return;
    }

    const filtered = all.filter(event => {
      if (filters.level?.length && !filters.level.includes(event.level)) return false;
      if (filters.mode?.length && !filters.mode.includes(event.mode)) return false;
      if (filters.category?.length && !filters.category.includes(event.category)) return false;
      if (filters.eventType?.length && !filters.eventType.includes(event.eventType)) return false;
      
      if (filters.city?.trim() && (!event.city || !event.city.toLowerCase().includes(filters.city.toLowerCase()))) return false;
      if (filters.country?.trim() && (!event.country || !event.country.toLowerCase().includes(filters.country.toLowerCase()))) return false;
      if (filters.rating > 0 && (event.rating || 0) < filters.rating) return false;

      if (filters.startDate) {
        const eStart = new Date(event.startDate).getTime();
        const fStart = new Date(filters.startDate).getTime();
        if (eStart < fStart) return false;
      }
      if (filters.endDate) {
        const eEnd = new Date(event.endDate).getTime();
        const fEnd = new Date(filters.endDate).getTime();
        if (eEnd > fEnd) return false;
      }

      if (filters.technologies?.length) {
        if (!event.technologies || !filters.technologies.some((t: string) => event.technologies.includes(t))) return false;
      }

      return true;
    });

    this.searchResults.set(filtered);
  }

  navigateToEventDetail(id: string): void {
    this.router.navigate(['/events', id]);
  }

  skeletonItems = Array(6).fill(null);
}
