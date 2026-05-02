import { request } from './client';
import type { PaymentCard, AddCardRequest } from '../types/api';

export function listCards(): Promise<PaymentCard[]> {
  return request<PaymentCard[]>('/cards', { auth: true });
}

export function addCard(data: AddCardRequest): Promise<PaymentCard> {
  return request<PaymentCard>('/cards', { method: 'POST', body: data, auth: true });
}

export function deleteCard(id: number): Promise<void> {
  return request<void>(`/cards/${id}`, { method: 'DELETE', auth: true });
}

export function setDefaultCard(id: number): Promise<PaymentCard> {
  return request<PaymentCard>(`/cards/${id}/default`, { method: 'PUT', auth: true });
}
