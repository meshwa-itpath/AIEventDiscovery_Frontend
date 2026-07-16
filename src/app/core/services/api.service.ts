import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  
  private baseUrl = environment.apiUrl;

  /**
   * Performs a GET request.
   */
  get<T>(endpoint: string, params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params });
  }

  /**
   * Performs a POST request.
   */
  post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { headers });
  }

  /**
   * Performs a PUT request.
   */
  put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, { headers });
  }

  /**
   * Performs a DELETE request.
   */
  delete<T>(endpoint: string, params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { params });
  }
}
