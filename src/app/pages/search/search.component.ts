import { Component, inject, signal, ViewChild, computed, effect, untracked, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { EventService } from '../../core/services/event.service';
import { RecommendedEvent } from '../../core/models/recommended-event.model';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';
import { DrawerModule } from 'primeng/drawer';
import { FilterFormComponent } from '../../shared/components/filter-form/filter-form.component';
import { SearchStateService } from '../../core/services/search-state.service';
import { SearchCacheService } from '../../core/services/search-cache.service';
import { LocalSearchComponent } from '../../shared/components/local-search/local-search.component';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SkeletonModule,
    EventCardComponent,
    DrawerModule,
    FilterFormComponent,
    LocalSearchComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  private router = inject(Router);
  private eventService = inject(EventService);
  private searchState = inject(SearchStateService);
  private searchCache = inject(SearchCacheService);

  filterDrawerVisible = signal(false);

  get searchQueryStr(): string {
    return this.searchState.searchQuery();
  }

  get pageHeading(): string {
    return this.hasActiveSearch() ? 'Search Results' : 'For You';
  }

  allFetchedEvents = signal<RecommendedEvent[] | null>(null);
  searchResults = signal<RecommendedEvent[] | null>(null);
  activeFilters = signal<any>(null);
  hasActiveFilters = computed(() => this.hasFilterValues(this.activeFilters()));
  hasActiveSearch = computed(() => !!this.searchState.searchQuery().trim() || this.hasActiveFilters());
  showFilterButton = computed(() => !this.searchState.isSearching() || this.hasActiveFilters() || !!this.searchState.searchQuery().trim());

  localSearchQuery = signal<string>('');

  get isSearching() {
    return this.searchState.isSearching;
  }

  isLoadingMore = signal(false);
  hasMore = signal(false);

  private readonly pageSize = 20;
  private currentPage = 1;

  @ViewChild(FilterFormComponent) filterFormComponent!: FilterFormComponent;

  private lastHandledTrigger = 0;

  constructor() {
    const shouldResetSearch = (history.state as any)?.resetSearch === true;
    if (shouldResetSearch) {
      this.searchState.clearSearch();
      this.activeFilters.set(null);
      this.localSearchQuery.set('');
      this.allFetchedEvents.set(null);
      this.searchResults.set(null);
    }

    effect(() => {
      const trigger = this.searchState.triggerSearch();
      if (trigger > 0 && trigger !== this.lastHandledTrigger) {
        this.lastHandledTrigger = trigger;
        untracked(() => {
          this.loadCurrentPageData();
        });
      }
    });
  }

  ngOnInit(): void {
    this.loadCurrentPageData();
  }

  private hasFilterValues(filters: any): boolean {
    if (!filters) return false;

    return Object.values(filters).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return value > 0;
      if (value instanceof Date) return true;
      return !!value;
    });
  }

  private loadCurrentPageData(): void {
    const query = this.searchState.searchQuery().trim();

    if (!query) {
      this.loadRecommendedEvents();
      return;
    }

    this.searchEvents();
  }

  /** Loads the default personalized recommendations */
  loadRecommendedEvents(): void {
    this.searchState.isSearching.set(true);
    this.currentPage = 1;

    this.eventService.getRecommendedEvents(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success) {
          this.allFetchedEvents.set(response.data);
          this.filterEvents();
          this.hasMore.set(response.pagination ? response.pagination.hasNextPage : response.data.length === this.pageSize);
        } else {
          this.allFetchedEvents.set([]);
          this.searchResults.set([]);
          this.hasMore.set(false);
        }
        this.searchState.isSearching.set(false);
      },
      error: (err) => {
        console.error('Error loading recommended events', err);
        this.searchState.isSearching.set(false);
        this.allFetchedEvents.set([]);
        this.searchResults.set([]);
        this.hasMore.set(false);
      }
    });
  }

  /** Fresh search — resets to page 1 */
  searchEvents(): void {
    const query = this.searchState.searchQuery().trim();
    if (!query) {
      this.loadRecommendedEvents();
      return;
    }

    this.searchState.isSearching.set(true);
    const cachedPage = this.searchCache.getPage(query, 1, this.pageSize);

    if (cachedPage) {
      this.currentPage = 1;
      this.allFetchedEvents.set(this.searchCache.getMergedResults(query, this.pageSize));
      this.hasMore.set(this.searchCache.hasMore(query, this.pageSize));
      this.filterEvents();
      this.searchState.isSearching.set(false);
      return;
    }

    this.currentPage = 1;

    this.eventService.searchEvents(query, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success) {
          this.searchCache.setPage(query, this.currentPage, response.data, response.pagination, this.pageSize);
          this.allFetchedEvents.set(this.searchCache.getMergedResults(query, this.pageSize));
          this.filterEvents();
          this.hasMore.set(response.pagination ? response.pagination.hasNextPage : response.data.length === this.pageSize);
        } else {
          this.allFetchedEvents.set([]);
          this.searchResults.set([]);
          this.hasMore.set(false);
        }
        this.searchState.isSearching.set(false);
      },
      error: (err) => {
        console.error('Error searching events', err);
        this.searchState.isSearching.set(false);
        this.allFetchedEvents.set([]);
        this.searchResults.set([]);
        this.hasMore.set(false);
      }
    });
  }

  /** Load next page and append to existing results */
  loadMoreResults(): void {
    if (this.isLoadingMore() || !this.hasMore()) return;

    const query = this.searchState.searchQuery().trim();
    this.isLoadingMore.set(true);
    const nextPage = this.currentPage + 1;

    if (query) {
      const cachedPage = this.searchCache.getPage(query, nextPage, this.pageSize);
      if (cachedPage) {
        this.currentPage = nextPage;
        this.allFetchedEvents.set(this.searchCache.getMergedResults(query, this.pageSize));
        this.hasMore.set(this.searchCache.hasMore(query, this.pageSize));
        this.filterEvents();
        this.isLoadingMore.set(false);
        return;
      }
    }

    const request$ = query
      ? this.eventService.searchEvents(query, nextPage, this.pageSize)
      : this.eventService.getRecommendedEvents(nextPage, this.pageSize);

    request$.subscribe({
      next: (response: any) => {
        const data = response?.data ?? [];
        if (response?.success && data.length > 0) {
          if (query) {
            this.searchCache.setPage(query, nextPage, data, response.pagination, this.pageSize);
            this.currentPage = nextPage;
            this.allFetchedEvents.set(this.searchCache.getMergedResults(query, this.pageSize));
          } else {
            this.currentPage = nextPage;
            this.allFetchedEvents.update((prev) => [...(prev ?? []), ...data]);
          }
          this.filterEvents();
          this.hasMore.set(response.pagination ? response.pagination.hasNextPage : data.length === this.pageSize);
        } else {
          this.hasMore.set(false);
        }
        this.isLoadingMore.set(false);
      },
      error: (err) => {
        console.error('Error loading more results', err);
        this.isLoadingMore.set(false);
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
    this.localSearchQuery.set('');
    if (this.filterFormComponent) {
      this.filterFormComponent.resetForm();
    }
    this.filterEvents();
  }

  onLocalSearchChanged(value: string): void {
    this.localSearchQuery.set(value);
    this.filterEvents();
  }

  private filterEvents(): void {
    const all = this.allFetchedEvents();
    if (!all) {
      this.searchResults.set(null);
      return;
    }

    const filters = this.activeFilters();
    const localQuery = this.localSearchQuery().toLowerCase().trim();

    if (!filters && !localQuery) {
      this.searchResults.set([...all]);
      return;
    }

    const filtered = all.filter(event => {
      if (filters) {
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
      }

      if (localQuery) {
        const titleMatch = event.title?.toLowerCase().includes(localQuery);
        const descMatch = event.description?.toLowerCase().includes(localQuery);
        if (!titleMatch && !descMatch) return false;
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
