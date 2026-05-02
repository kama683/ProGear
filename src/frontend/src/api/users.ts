import { request } from './client';
import type { User } from '../types/api';

export function getMe(): Promise<User> {
  return request<User>('/users/me', { auth: true });
}

export function updateProfile(data: { Phone: string; Address: string }): Promise<User> {
  return request<User>('/users/me', { method: 'PUT', body: data, auth: true });
}

export function listUsers(): Promise<User[]> {
  return request<User[]>('/users', { auth: true });
}
