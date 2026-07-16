import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);

  /**
   * Registers a new user.
   * Endpoint: POST /api/auth/register
   * @param payload The registration details
   */
  register(payload: any): Observable<any> {
    return this.api.post('auth/register', payload);
  }

  /**
   * Authenticates a user and returns a token.
   * Endpoint: POST /api/auth/login
   * @param payload The login credentials
   */
  login(payload: any): Observable<any> {
    return this.api.post('auth/login', payload);
  }
}
