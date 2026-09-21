import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { RecommendedEventsResponse, SearchEventsResponse, EventDetailResponse } from '../models/recommended-event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiService = inject(ApiService);

  /**
   * Fetches personalized "For You" events with pagination.
   * @param page     1-based page number
   * @param pageSize number of events per page
   * @param level    optional skill level filter (empty string = no filter)
   * @param mode     optional mode filter (empty string = no filter)
   */
  getRecommendedEvents(
    page: number = 1,
    pageSize: number = 10,
    level: string = '',
    mode: string = ''
  ): Observable<RecommendedEventsResponse> {
    return this.apiService.get<RecommendedEventsResponse>('events/for-you', {
      page,
      pageSize,
      level,
      mode
    });
  }

  /**
   * Searches events by a query string with pagination.
   * @param query    search term
   * @param page     1-based page number
   * @param pageSize number of events per page
   * @param level    optional skill level filter
   * @param mode     optional mode filter
   */
  searchEvents(
    query: string,
    page: number = 1,
    pageSize: number = 10,
    level: string = '',
    mode: string = ''
  ): Observable<SearchEventsResponse> {
    return this.apiService.get<SearchEventsResponse>('Events/search', {
      query,
      page,
      pageSize,
      level,
      mode
    });
  }

  /**
   * Fetches the full detail of a single event by its ID.
   * Endpoint: GET /api/Events/{id}
   * @param id  The GUID of the event
   */
  getEventById(id: string): Observable<EventDetailResponse> {
    return this.apiService.get<EventDetailResponse>(`Events/${id}`);
  }

  /**
   * Fetches related events for a given event ID.
   * Endpoint: GET /api/Events/{id}/related
   * @param id The GUID of the event
   */
  getRelatedEvents(id: string): Observable<RecommendedEventsResponse> {
    return this.apiService.get<RecommendedEventsResponse>(`events/${id}/related`);
  }
}

