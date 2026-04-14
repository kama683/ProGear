import { request } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '../types/api';


export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: data,
  });
}


export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: data,
  });
  localStorage.setItem('access_token', res.AccessToken);
  localStorage.setItem('refresh_token', res.RefreshToken);
  localStorage.setItem('user', JSON.stringify(res.User));
  return res;
}


export function logout(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}


export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}