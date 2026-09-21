import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  searchQuery = signal<string>('');
  triggerSearch = signal<number>(0);
  isSearching = signal<boolean>(false);

  executeSearch(query: string) {
    this.searchQuery.set(query);
    this.triggerSearch.set(Date.now());
  }
}
