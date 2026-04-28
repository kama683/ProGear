import { request } from './client';
import type { ReviewSummary, ReviewCreateRequest, ReviewResponse } from '../types/api';

export function getReviews(equipmentId: number): Promise<ReviewSummary> {
  return request<ReviewSummary>(`/equipment/${equipmentId}/reviews`);
}

export function createReview(equipmentId: number, data: ReviewCreateRequest): Promise<ReviewResponse> {
  return request<ReviewResponse>(`/equipment/${equipmentId}/reviews`, {
    method: 'POST',
    body: data,
    auth: true,
  });
}
