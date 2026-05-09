// Cliente de subida de archivos. NO usa apiFetch porque ese helper hace
// JSON.stringify(body) y setea Content-Type: application/json — para
// multipart necesitamos que fetch lo arme con su propio boundary.

import { useAuthStore } from '../auth-store';
import { ApiError } from '../api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface UploadResponse {
  url: string;
  key: string;
  contentType: string;
  size: number;
}

interface ErrorResponseBody {
  message?: string | string[];
  error?: string;
}

function extractMessage(body: unknown): string {
  if (typeof body !== 'object' || body === null) return 'Error al subir el archivo';
  const b = body as ErrorResponseBody;
  if (Array.isArray(b.message)) return b.message.join(', ');
  if (typeof b.message === 'string') return b.message;
  if (typeof b.error === 'string') return b.error;
  return 'Error al subir el archivo';
}

export const uploadApi = {
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const token = useAuthStore.getState().accessToken;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    let parsed: unknown = null;
    try {
      parsed = await res.json();
    } catch {
      // sin body o body no-json
    }

    if (!res.ok) {
      if (res.status === 401) {
        useAuthStore.getState().logout();
      }
      throw new ApiError(res.status, parsed, extractMessage(parsed));
    }

    return parsed as UploadResponse;
  },
};
