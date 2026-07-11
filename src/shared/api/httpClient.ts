import { HttpError } from './HttpError';

const BASE_URL = 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }

  return await response.json() as T;
}

export const httpClient = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, payload: unknown, signal?: AbortSignal) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(payload), signal }),
};
