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
  explanation?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RecommendedEventsResponse {
  success: boolean;
  message: string;
  data: RecommendedEvent[];
  pagination?: PaginationMeta;
}

export interface SearchEventsResponse {
  success: boolean;
  message: string;
  data: RecommendedEvent[];
  pagination?: PaginationMeta;
}

export interface EventDetailResponse {
  success: boolean;
  message: string;
  data: RecommendedEvent;
}
