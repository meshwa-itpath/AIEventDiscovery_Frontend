import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(ApiService);

  /**
   * Saves onboarding details for a new user.
   * Endpoint: POST /api/User/SaveOnBoardingDetail
   * @param payload { role: string | null, technology: string[] | null }
   */
  saveOnboardingDetail(payload: { role: string | null; technology: string[] | null }): Observable<any> {
    return this.api.post('User/SaveOnBoardingDetail', payload);
  }
}
