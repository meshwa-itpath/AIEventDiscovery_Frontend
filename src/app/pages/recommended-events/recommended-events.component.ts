import { Component, inject, OnInit, signal, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { EventService } from '../../core/services/event.service';
import { RecommendedEvent } from '../../core/models/recommended-event.model';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-recommended-events',
  imports: [CommonModule, ButtonModule, SkeletonModule, EventCardComponent, TagModule],
  templateUrl: './recommended-events.component.html',
  styleUrl: './recommended-events.component.css',
})
export class RecommendedEventsComponent implements OnInit, OnDestroy {
  @ViewChild('sentinel') set sentinelElement(element: ElementRef<HTMLDivElement> | undefined) {
    if (element?.nativeElement) {
      this.setupIntersectionObserver(element.nativeElement);
    }
  }

  private eventService = inject(EventService);
  private router = inject(Router);

  events = signal<RecommendedEvent[]>([]);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  hasMore = signal(true);
  error = signal<string | null>(null);

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
