import { request } from './client';
import type { Order, CreateOrderRequest, OrderStatusUpdateRequest, Invoice } from '../types/api';

export function listOrders(): Promise<Order[]> {
  return request<Order[]>('/orders', { auth: true });
}

export function createOrder(data: CreateOrderRequest): Promise<Order> {
  return request<Order>('/orders', { method: 'POST', body: data, auth: true });
}

export function updateOrderStatus(id: number, data: OrderStatusUpdateRequest): Promise<Order> {
  return request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: data, auth: true });
}

export function getInvoice(orderId: number): Promise<Invoice> {
  return request<Invoice>(`/orders/${orderId}/invoice`, { auth: true });
}
