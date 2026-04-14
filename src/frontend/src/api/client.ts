const BASE_URL = '/api/v1';


export class ApiResponseError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiResponseError';
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

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
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
    } catch {
      console.log('ign json if error body')
    }
    throw new ApiResponseError(message, response.status);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}