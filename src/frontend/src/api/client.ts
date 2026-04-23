const BASE_URL = (import.meta.env.VITE_API_URL ?? '') + '/api/v1';

export class ApiResponseError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiResponseError';
    this.status = status;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody?.error) message = errBody.error;
    } catch { /* ignore */ }
    throw new ApiResponseError(message, response.status);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}
