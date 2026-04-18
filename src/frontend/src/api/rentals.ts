import { request } from './client';
import type { AvailabilityResponse, BookingRequest, BookingResponse, CalculateRequest, CalculateResponse } from '../types/api';

export function checkAvailability(equipmentId: number, startAt: string, endAt: string): Promise<AvailabilityResponse> {
  const qs = new URLSearchParams({ equipmentId: String(equipmentId), startAt, endAt });
  return request<AvailabilityResponse>(`/rentals/availability?${qs}`);
}

export function calculateRental(data: CalculateRequest): Promise<CalculateResponse> {
  return request<CalculateResponse>('/rentals/calculate', { method: 'POST', body: data });
}

export function bookRental(data: BookingRequest): Promise<BookingResponse> {
  return request<BookingResponse>('/rentals/book', { method: 'POST', body: data, auth: true });
}
