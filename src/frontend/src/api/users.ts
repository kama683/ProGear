import { request } from './client';
import type { User } from '../types/api';

export function getMe(): Promise<User> {
  return request<User>('/users/me', { auth: true });
}

export function listUsers(): Promise<User[]> {
  return request<User[]>('/users', { auth: true });
}
