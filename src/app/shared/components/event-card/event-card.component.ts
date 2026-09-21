import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PopoverModule } from 'primeng/popover';
import { RecommendedEvent } from '../../../core/models/recommended-event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonModule, TagModule, PopoverModule],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css',
})
export class EventCardComponent {
  event = input.required<RecommendedEvent>();
  showMatchBadge = input<boolean>(true);
  /** When true, hides description and location for a compact horizontal-scroll layout */
  compactMode = input<boolean>(false);

  cardClick = output<string>();

  onViewDetails(): void {
    this.cardClick.emit(this.event().id);
  }

  /**
   * Returns the visible subset of technologies.
   * Compact mode shows 2 max; normal mode shows 3 max.
   */
  visibleTechs(): string[] {
    const max = this.compactMode() ? 2 : 3;
    return (this.event().technologies || []).slice(0, max);
  }

  /**
   * Returns the hidden technologies (those not shown as visible chips).
   * Used to populate the hover popover on the +N badge.
   */
  hiddenTechs(): string[] {
    const max = this.compactMode() ? 2 : 3;
    return (this.event().technologies || []).slice(max);
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
}
