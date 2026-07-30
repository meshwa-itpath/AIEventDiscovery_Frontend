import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { RecommendedEventsResponse } from '../models/recommended-event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiService = inject(ApiService);

  getRecommendedEvents(limit: number = 10, offset: number = 0): Observable<RecommendedEventsResponse> {
    return this.apiService.get<RecommendedEventsResponse>('events/for-you', { limit, offset });
  }
}
