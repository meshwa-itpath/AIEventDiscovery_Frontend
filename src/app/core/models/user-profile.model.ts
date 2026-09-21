export interface UserProfile {
  firstName: string;
  lastName: string;
  email?: string;
  role: string | null;
  primaryStacks?: string[] | null;
  interests?: string[] | null;
  // technology?: string[] | null;
}

export interface SaveOnboardingDetailRequest {
  role: string | null;
  primaryStacks: string[];
  interests: string[];
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  role: string | null;
  primaryStacks: string[];
  interests: string[];
  // technology?: string[] | null;
}
