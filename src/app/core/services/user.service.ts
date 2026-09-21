import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { UserProfile, UpdateProfileRequest, SaveOnboardingDetailRequest } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(ApiService);

  /**
   * Saves onboarding details for a new user.
   * Endpoint: POST /api/User/SaveOnBoardingDetail
   * @param payload { role, primaryStacks, interests }
   */
  saveOnboardingDetail(payload: SaveOnboardingDetailRequest | { role: string | null; technology?: string[] | null; primaryStacks?: string[] | null; interests?: string[] | null }): Observable<any> {
    return this.api.post('User/SaveOnBoardingDetail', payload);
  }

  /**
   * Fetches the current authenticated user's profile.
   * Endpoint: GET /api/User/GetProfile
   */
  getProfile(): Observable<any> {
    return this.api.get<any>('User/GetProfile');
  }

  /**
   * Updates the current authenticated user's profile.
   * Endpoint: PUT /api/User/UpdateProfile
   * @param payload { firstName, lastName, role, primaryStacks, interests }
   */
  updateProfile(payload: UpdateProfileRequest): Observable<any> {
    return this.api.put<any>('User/UpdateProfile', payload);
  }
}
