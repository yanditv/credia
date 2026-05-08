// Cliente fetch tipado contra el API NestJS de Credia.
// Lee el access token del store de auth y agrega Authorization en cada request.
// Si la respuesta es 401, limpia el store (logout automático).

import { useAuthStore } from './auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  withAuth?: boolean;
}

interface ErrorResponseBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

function extractMessage(body: unknown): string {
  if (typeof body !== 'object' || body === null) return 'Error desconocido';
  const b = body as ErrorResponseBody;
  if (Array.isArray(b.message)) return b.message.join(', ');
  if (typeof b.message === 'string') return b.message;
  if (typeof b.error === 'string') return b.error;
  return 'Error desconocido';
}

export async function apiFetch<T = unknown>(
  path: string,
  { method = 'GET', body, withAuth = true }: ApiOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (withAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    // sin body o body no-json
  }

  if (!res.ok) {
    if (res.status === 401 && withAuth) {
      useAuthStore.getState().logout();
    }
    throw new ApiError(res.status, parsed, extractMessage(parsed));
  }

  return parsed as T;
}
