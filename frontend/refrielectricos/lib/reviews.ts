import api from './api';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  product?: {
    id: string;
    name: string;
    image_url: string;
    slug: string;
  };
}

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment: string;
}

export interface PendingProduct {
  id: string;
  name: string;
  image_url: string | null;
  slug: string;
}

export const reviewsService = {
  create: async (data: CreateReviewDto) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  findByProduct: async (productId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },

  checkEligibility: async (productId: string) => {
    const response = await api.get(`/reviews/eligibility/${productId}`);
    return response.data;
  },

  getMyReviews: async (): Promise<Review[]> => {
    const response = await api.get('/reviews/user/my-reviews');
    return response.data;
  },

  getPendingReviews: async (): Promise<PendingProduct[]> => {
    const response = await api.get('/reviews/user/pending');
    return response.data;
  },
};
