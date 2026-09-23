import { Injectable } from '@angular/core';
import { RecommendedEvent } from '../models/recommended-event.model';

interface SearchCachePageEntry {
  data: RecommendedEvent[];
  pagination: any | null;
  cachedAt: number;
}

interface QueryCacheEntry {
  pages: Map<number, SearchCachePageEntry>;
  lastPagination: any | null;
  cachedAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class SearchCacheService {
  private readonly ttlMs = 5 * 60 * 1000;
  private readonly cache = new Map<string, QueryCacheEntry>();

  normalizeQuery(query: string): string {
    return query.trim().toLowerCase();
  }

  hasPage(query: string, page: number, pageSize: number = 20): boolean {
    const key = this.makeQueryKey(query, pageSize);
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    const pageEntry = entry.pages.get(page);
    if (!pageEntry) {
      return false;
    }

    return !this.isExpired(pageEntry.cachedAt);
  }

  getPage(query: string, page: number, pageSize: number = 20): RecommendedEvent[] | null {
    const key = this.makeQueryKey(query, pageSize);
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const pageEntry = entry.pages.get(page);
    if (!pageEntry || this.isExpired(pageEntry.cachedAt)) {
      if (pageEntry) {
        entry.pages.delete(page);
      }
      return null;
    }

    return [...pageEntry.data];
  }

  setPage(query: string, page: number, data: RecommendedEvent[], pagination: any = null, pageSize: number = 20): void {
    const key = this.makeQueryKey(query, pageSize);
    const existing = this.cache.get(key) ?? {
      pages: new Map<number, SearchCachePageEntry>(),
      lastPagination: null,
      cachedAt: Date.now(),
    };

    existing.pages.set(page, {
      data: [...data],
      pagination,
      cachedAt: Date.now(),
    });
    existing.lastPagination = pagination;
    existing.cachedAt = Date.now();

    this.cache.set(key, existing);
  }

  getMergedResults(query: string, pageSize: number = 20): RecommendedEvent[] {
    const key = this.makeQueryKey(query, pageSize);
    const entry = this.cache.get(key);
    if (!entry) {
      return [];
    }

    const validEntries = Array.from(entry.pages.entries())
      .filter(([, pageEntry]) => !this.isExpired(pageEntry.cachedAt))
      .sort(([pageA], [pageB]) => pageA - pageB);

    const merged: RecommendedEvent[] = [];
    const seenIds = new Set<string>();

    validEntries.forEach(([, pageEntry]) => {
      pageEntry.data.forEach((event) => {
        const eventId = (event as any)?.id ?? (event as any)?.eventId ?? '';
        if (eventId && seenIds.has(eventId)) {
          return;
        }

        if (eventId) {
          seenIds.add(eventId);
        }

        merged.push(event);
      });
    });

    return merged;
  }

  hasMore(query: string, pageSize: number = 20): boolean {
    const key = this.makeQueryKey(query, pageSize);
    const entry = this.cache.get(key);
    if (!entry || !entry.lastPagination) {
      return false;
    }

    return !!entry.lastPagination.hasNextPage;
  }

  clearQuery(query: string, pageSize: number = 20): void {
    this.cache.delete(this.makeQueryKey(query, pageSize));
  }

  clearAll(): void {
    this.cache.clear();
  }

  private makeQueryKey(query: string, pageSize: number): string {
    return `${this.normalizeQuery(query)}|size=${pageSize}`;
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.ttlMs;
  }
}
