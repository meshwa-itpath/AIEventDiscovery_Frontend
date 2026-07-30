export interface RecommendedEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  technologies: string[];
  tags: string[];
  organizer: string;
  city: string;
  country: string;
  venue: string;
  mode: string;
  level: string;
  eventType: string;
  startDate: string;
  endDate: string;
  rating: number;
  similarityScore: number;
}

export interface RecommendedEventsResponse {
  success: boolean;
  message: string;
  data: RecommendedEvent[];
}
