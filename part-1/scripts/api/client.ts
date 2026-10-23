import { API } from '../shared/types';

const DEFAULT_TIMEOUT_MS = 10_000;

export function getBaseUrl(): string {
  if (
    !import.meta.env.VITE_API_BASE_URL ||
    !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(import.meta.env.VITE_API_BASE_URL)
  ) {
    throw new Error('Invalid URL');
  }

  return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
}

async function request(
  path: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      // TBD: Would be a custom error needed in this case to debug the api-specific errors(?
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new DOMException('The request timed out', 'AbortError');
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

/**
 * Since this use case only requires the most basic operations i've decided
 * to implmement a simple API client with only GET and POST methods.
 *
 * This can be extended or replaced in the future if needed. For example for axios or other libraries that provide more features like interceptors, retries, etc.
 */
export const api: API = {
  async get(path: string): Promise<Response> {
    return request(path, { method: 'GET' }, DEFAULT_TIMEOUT_MS);
  },
  async post(path: string, body: unknown): Promise<Response> {
    return request(
      path,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      DEFAULT_TIMEOUT_MS,
    );
  },
};
