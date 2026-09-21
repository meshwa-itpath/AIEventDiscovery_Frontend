import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { RecommendedEvent } from '../../core/models/recommended-event.model';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, SkeletonModule, ButtonModule, TagModule, EventCardComponent],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css',
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);

  isLoading = signal(true);
  event = signal<RecommendedEvent | null>(null);
  error = signal<string | null>(null);

  isRelatedLoading = signal(true);
  relatedEvents = signal<RecommendedEvent[] | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.router.navigate(['/search']);
        return;
      }
      this.loadEvent(id);
      this.loadRelatedEvents(id);
    });
  }

  loadEvent(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.eventService.getEventById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.event.set(res.data);
        } else {
          this.error.set(res.message || 'Event not found.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load event details. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  loadRelatedEvents(id: string): void {
    this.isRelatedLoading.set(true);
    this.eventService.getRelatedEvents(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.relatedEvents.set(res.data);
        } else {
          this.relatedEvents.set([]);
        }
        this.isRelatedLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading related events', err);
        this.relatedEvents.set([]);
        this.isRelatedLoading.set(false);
      }
    });
  }

  navigateToEventDetail(id: string): void {
    this.router.navigate(['/events', id]);
    // Scrolling to top is good UX when navigating between details
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }

  getModeIcon(mode: string): string {
    return mode?.toLowerCase() === 'online' ? 'pi pi-globe' : 'pi pi-map-marker';
  }

  getLocationDisplay(event: RecommendedEvent): string {
    if (event.mode?.toLowerCase() === 'online') {
      return event.venue || 'Online';
    }
    const parts = [event.venue, event.city, event.country].filter(Boolean);
    return parts.join(', ') || '—';
  }

  getMatchSeverity(score: number): 'success' | 'info' | 'warn' {
    const pct = Math.round(score * 100);
    if (pct >= 90) return 'success';
    if (pct >= 75) return 'info';
    return 'warn';
  }

  retry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadEvent(id);
  }
}
