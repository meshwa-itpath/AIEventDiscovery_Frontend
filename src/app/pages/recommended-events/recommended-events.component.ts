import { Component, inject, OnInit, signal, ViewChild, ElementRef, OnDestroy, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { EventService } from '../../core/services/event.service';
import { RecommendedEvent } from '../../core/models/recommended-event.model';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';
import { TagModule } from 'primeng/tag';
import { LocalSearchComponent } from '../../shared/components/local-search/local-search.component';
import { DrawerModule } from 'primeng/drawer';
import { FilterFormComponent } from '../../shared/components/filter-form/filter-form.component';

@Component({
  selector: 'app-recommended-events',
  imports: [CommonModule, ButtonModule, SkeletonModule, EventCardComponent, TagModule, LocalSearchComponent, DrawerModule, FilterFormComponent],
  templateUrl: './recommended-events.component.html',
  styleUrl: './recommended-events.component.css',
})
export class RecommendedEventsComponent implements OnInit, OnDestroy {
  @ViewChild('sentinel') set sentinelElement(element: ElementRef<HTMLDivElement> | undefined) {
    if (element?.nativeElement) {
      this.setupIntersectionObserver(element.nativeElement);
    }
  }

  @ViewChild(FilterFormComponent) filterFormComponent!: FilterFormComponent;

  private eventService = inject(EventService);
  private router = inject(Router);

  events = signal<RecommendedEvent[]>([]);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  hasMore = signal(true);
  error = signal<string | null>(null);
  localSearchQuery = signal<string>('');
  filterDrawerVisible = false;
  activeFilters = signal<any>(null);
  hasActiveFilters = computed(() => this.hasFilterValues(this.activeFilters()));
  showFilterButton = computed(() => !this.isLoading() || this.hasActiveFilters());

  filteredEvents = computed(() => {
    const all = this.events();
    const filters = this.activeFilters();
    const q = this.localSearchQuery().toLowerCase().trim();

    let result = all;

    if (filters) {
      result = result.filter((event) => this.matchesFilters(event, filters));
    }

    if (q) {
      result = result.filter((event) =>
        event.title?.toLowerCase().includes(q) ||
        event.description?.toLowerCase().includes(q)
      );
    }

    return result;
  });

  onLocalSearchChanged(value: string) {
    this.localSearchQuery.set(value);
  }

  onFiltersApplied(filters: any): void {
    this.activeFilters.set(filters);
    this.filterDrawerVisible = false;
  }

  clearFilters(): void {
    this.activeFilters.set(null);
    this.localSearchQuery.set('');
    if (this.filterFormComponent) {
      this.filterFormComponent.resetForm();
    }
    this.filterDrawerVisible = false;
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

  private matchesFilters(event: RecommendedEvent, filters: any): boolean {
    if (filters.level?.length && !filters.level.includes(event.level)) return false;
    if (filters.mode?.length && !filters.mode.includes(event.mode)) return false;
    if (filters.category?.length && !filters.category.includes(event.category)) return false;
    if (filters.eventType?.length && !filters.eventType.includes(event.eventType)) return false;
    if (filters.city?.trim() && (!event.city || !event.city.toLowerCase().includes(filters.city.toLowerCase()))) return false;
    if (filters.country?.trim() && (!event.country || !event.country.toLowerCase().includes(filters.country.toLowerCase()))) return false;
    if (filters.rating > 0 && (event.rating || 0) < filters.rating) return false;

    if (filters.startDate) {
      const eventStart = new Date(event.startDate).getTime();
      const filterStart = new Date(filters.startDate).getTime();
      if (eventStart < filterStart) return false;
    }

    if (filters.endDate) {
      const eventEnd = new Date(event.endDate).getTime();
      const filterEnd = new Date(filters.endDate).getTime();
      if (eventEnd > filterEnd) return false;
    }

    if (filters.technologies?.length) {
      if (!event.technologies || !filters.technologies.some((t: string) => event.technologies.includes(t))) return false;
    }

    return true;
  }

  private readonly pageSize = 20;
  private currentPage = 1;
  private totalPages = 1;
  private observer?: IntersectionObserver;

  skeletonItems = Array(8).fill(null);

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /** Initial load — resets everything */
  loadEvents(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.hasMore.set(true);
    this.currentPage = 1;

    this.eventService.getRecommendedEvents(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res.success) {
          this.events.set(res.data);
          if (res.pagination) {
            this.totalPages = res.pagination.totalPages;
            this.hasMore.set(res.pagination.hasNextPage);
          } else {
            // Fallback: if no pagination meta, infer from data length
            this.hasMore.set(res.data.length === this.pageSize);
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load recommended events. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  /** Fetch next page and append */
  loadMore(): void {
    if (this.isLoadingMore() || !this.hasMore() || this.isLoading()) return;
    this.isLoadingMore.set(true);
    this.currentPage++;

    this.eventService.getRecommendedEvents(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          this.events.update((prev) => [...prev, ...res.data]);
          if (res.pagination) {
            this.hasMore.set(res.pagination.hasNextPage);
          } else {
            this.hasMore.set(res.data.length === this.pageSize);
          }
        } else {
          this.hasMore.set(false);
          this.currentPage--; // revert on empty response
        }
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.isLoadingMore.set(false);
        this.currentPage--; // revert on error
      },
    });
  }

  private setupIntersectionObserver(element: HTMLElement): void {
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore() && !this.isLoadingMore() && !this.isLoading()) {
          this.loadMore();
        }
      },
      { rootMargin: '250px' }
    );
    this.observer.observe(element);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.hasMore() || this.isLoadingMore() || this.isLoading()) return;
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollPosition >= documentHeight - 300) {
      this.loadMore();
    }
  }

  viewDetails(id: string): void {
    this.router.navigate(['/events', id]);
  }
}
