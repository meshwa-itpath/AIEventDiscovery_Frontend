import { Component, inject, OnInit, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { EventService } from '../../core/services/event.service';
import { RecommendedEvent } from '../../core/models/recommended-event.model';

@Component({
  selector: 'app-recommended-events',
  imports: [CommonModule, DatePipe, ButtonModule, TagModule, SkeletonModule],
  templateUrl: './recommended-events.component.html',
  styleUrl: './recommended-events.component.css',
})
export class RecommendedEventsComponent implements OnInit, AfterViewInit {
  @ViewChild('scrollContainer') scrollContainerRef!: ElementRef<HTMLDivElement>;

  private eventService = inject(EventService);

  events = signal<RecommendedEvent[]>([]);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  hasMore = signal(true);
  error = signal<string | null>(null);

  canScrollLeft = signal(false);
  canScrollRight = signal(false);

  private readonly limit = 10;
  private offset = 0;

  ngOnInit(): void {
    this.loadEvents();
  }

  ngAfterViewInit(): void {
    // update chevron state after view initializes
    setTimeout(() => this.updateScrollState(), 100);
  }

  /** Initial load — resets everything */
  loadEvents(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.hasMore.set(true);
    this.offset = 0;
    this.eventService.getRecommendedEvents(this.limit, this.offset).subscribe({
      next: (res) => {
        if (res.success) {
          this.events.set(res.data);
          this.offset = res.data.length;
          if (res.data.length === 0) {
            this.hasMore.set(false);
          }
        }
        this.isLoading.set(false);
        setTimeout(() => this.updateScrollState(), 50);
      },
      error: () => {
        this.error.set('Failed to load recommended events. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  /** Fetch next page and append */
  loadMore(): void {
    if (this.isLoadingMore() || !this.hasMore()) return;
    this.isLoadingMore.set(true);
    this.eventService.getRecommendedEvents(this.limit, this.offset).subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          this.events.update((prev) => [...prev, ...res.data]);
          this.offset += res.data.length;
          if (res.data.length < this.limit) {
            this.hasMore.set(false);
          }
        } else {
          this.hasMore.set(false);
        }
        this.isLoadingMore.set(false);
        setTimeout(() => this.updateScrollState(), 50);
      },
      error: () => {
        this.isLoadingMore.set(false);
      },
    });
  }

  /** Scroll left by one "page" (= container visible width) */
  scrollLeft(): void {
    const el = this.scrollContainerRef?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
  }

  /**
   * Scroll right by one "page".
   * If we're within 2 pages of the end, proactively load more data.
   */
  scrollRight(): void {
    const el = this.scrollContainerRef?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });

    const afterScroll = el.scrollLeft + el.clientWidth;
    const threshold = el.scrollWidth - el.clientWidth * 2; // 2 pages from end
    if (afterScroll >= threshold && this.hasMore() && !this.isLoadingMore()) {
      this.loadMore();
    }
  }

  /** Called on (scroll) event — keeps chevron visibility in sync */
  onScroll(): void {
    this.updateScrollState();
  }

  private updateScrollState(): void {
    const el = this.scrollContainerRef?.nativeElement;
    if (!el) return;
    this.canScrollLeft.set(el.scrollLeft > 10);
    const atRightEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
    // can scroll right if NOT at right end, OR if there is more data to load
    this.canScrollRight.set(!atRightEnd || this.hasMore());
  }

  getMatchPercent(score: number): number {
    return Math.round(score * 100);
  }

  getMatchSeverity(score: number): 'success' | 'info' | 'warn' {
    const pct = this.getMatchPercent(score);
    if (pct >= 90) return 'success';
    if (pct >= 75) return 'info';
    return 'warn';
  }

  getModeIcon(mode: string): string {
    return mode?.toLowerCase() === 'online' ? 'pi pi-globe' : 'pi pi-map-marker';
  }

  getLocationDisplay(event: RecommendedEvent): string {
    if (event.mode?.toLowerCase() === 'online') {
      return event.venue || 'Online';
    }
    return [event.city, event.country].filter(Boolean).join(', ');
  }

  skeletonItems = Array(4).fill(null);
}
