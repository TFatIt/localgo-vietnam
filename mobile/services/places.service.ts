import api from './api';

export interface Place {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  province: string;
  address: string;
  location: { coordinates: [number, number] };
  images: string[];
  coverImage: string;
  communityRating: number;
  reviewCount: number;
  checkinCount: number;
  isHiddenGem: boolean;
  isTrending: boolean;
  isVerified: boolean;
  tags: string[];
  openingHours?: Record<string, string>;
  ticketPrice?: { adult?: number; child?: number; currency: string };
  facilities: string[];
  travelTips: string[];
  bestVisitingSeason: string[];
  history?: string;
  isBookmarked?: boolean;
  recentReviews?: Review[];
}

export interface Review {
  _id: string;
  userId: { _id: string; displayName: string; avatar?: string };
  rating: number;
  title?: string;
  body: string;
  photos: string[];
  helpfulCount: number;
  travelType?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Places
export const placesService = {
  getPlaces: (params?: Record<string, unknown>) =>
    api.get('/places', { params }).then((r) => r.data),

  getPlaceById: (id: string) => api.get(`/places/${id}`).then((r) => r.data),

  getNearby: (lat: number, lng: number, params?: Record<string, unknown>) =>
    api.get('/places/nearby', { params: { lat, lng, ...params } }).then((r) => r.data),

  getTrending: () => api.get('/places/trending').then((r) => r.data),

  getHiddenGems: (province?: string) =>
    api.get('/places/hidden-gems', { params: { province } }).then((r) => r.data),

  searchPlaces: (query: string, filters?: Record<string, unknown>) =>
    api.get('/places', { params: { search: query, ...filters } }).then((r) => r.data),
};

// Reviews
export const reviewsService = {
  getPlaceReviews: (placeId: string, page = 1) =>
    api.get(`/places/${placeId}/reviews`, { params: { page } }).then((r) => r.data),

  createReview: (placeId: string, data: FormData) =>
    api.post(`/places/${placeId}/reviews`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  voteHelpful: (reviewId: string) =>
    api.post(`/places/reviews/${reviewId}/helpful`).then((r) => r.data),
};

// Community
export const communityService = {
  getFeed: (params?: Record<string, unknown>) =>
    api.get('/community/feed', { params }).then((r) => r.data),

  createPost: (data: FormData) =>
    api.post('/community', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  toggleLike: (postId: string) =>
    api.post(`/community/${postId}/like`).then((r) => r.data),

  getComments: (postId: string, page = 1) =>
    api.get(`/community/${postId}/comments`, { params: { page } }).then((r) => r.data),

  createComment: (postId: string, content: string) =>
    api.post(`/community/${postId}/comments`, { content }).then((r) => r.data),
};

// AI
export const aiService = {
  generatePlan: (data: Record<string, unknown>) =>
    api.post('/ai/plan', data).then((r) => r.data),

  chat: (messages: Array<{ role: string; content: string }>) =>
    api.post('/ai/chat', { messages }).then((r) => r.data),

  generateJournalStory: (entries: unknown[]) =>
    api.post('/ai/journal-story', { entries }).then((r) => r.data),
};

// Engagement
export const engagementService = {
  getBookmarks: (page = 1) =>
    api.get('/me/bookmarks', { params: { page } }).then((r) => r.data),

  toggleBookmark: (placeId: string) =>
    api.post(`/me/bookmarks/${placeId}`).then((r) => r.data),

  getFavorites: (page = 1) =>
    api.get('/me/favorites', { params: { page } }).then((r) => r.data),

  toggleFavorite: (placeId: string) =>
    api.post(`/me/favorites/${placeId}`).then((r) => r.data),

  checkIn: (data: Record<string, unknown>) =>
    api.post('/me/checkins', data).then((r) => r.data),

  getCheckIns: (page = 1) =>
    api.get('/me/checkins', { params: { page } }).then((r) => r.data),

  getLeaderboard: () => api.get('/me/leaderboard').then((r) => r.data),
};

// Auth
export const authApiService = {
  login: (idToken: string, fcmToken?: string) =>
    api.post('/auth/login', { idToken, fcmToken }).then((r) => r.data),

  getMe: () => api.get('/auth/me').then((r) => r.data),

  updateProfile: (data: FormData | Record<string, unknown>) =>
    api.patch('/auth/me', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }).then((r) => r.data),

  deleteAccount: () => api.delete('/auth/me').then((r) => r.data),
};
