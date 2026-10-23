// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, getBaseUrl } from './client';

// #region mocked fetch and helpers

const fetchMock = vi.fn<typeof fetch>();

function okResponse(body: unknown = {}, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function lastCall(): { url: string; init: RequestInit } {
  const call = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
  if (!call) throw new Error('fetch was not called');
  return { url: String(call[0]), init: call[1] ?? {} };
}

/** A fetch that never resolves, but rejects when its signal aborts (like the real one). */
function hangingFetch(_input: RequestInfo | URL, init?: RequestInit) {
  return new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () =>
      reject(new DOMException('Aborted', 'AbortError')),
    );
  });
}

// #endregion

// #region Setup

const newShipment = {
  name: 'Jane Doe',
  city: 'Eindhoven',
  country: 'NL',
  shipping_preference: 'fast',
  insured: false,
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock); // replaces all the calls to fetch into our mock fn.
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

// #endregion

// #region Tests

/**
 * This should make errors with the .env easier to spot
 */
describe('base URL', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', ''); // overrides the env var
  });

  it('uses VITE_API_BASE_URL when set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
    fetchMock.mockResolvedValue(okResponse([]));

    await api.get('/some-endpoint');

    expect(lastCall().url).toBe('https://api.example.com/some-endpoint');
  });

  it('removes slash from the base URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/');

    expect(getBaseUrl()).toBe('https://api.example.com');
  });

  it('throws an error if the API base URL is invalid', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'not-a-url');

    expect(() => getBaseUrl()).toThrow('Invalid URL');
  });
});

/**
 * Very simple test to verify that the API client is calling fetch with the correct parameters and handling errors correctly.
 */
describe('API client', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com'); // overrides the env var
  });
  it('sends a GET request', async () => {
    const response = new Response('OK', { status: 200 });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);

    const result = await api.get('/shipping-methods');

    expect(result).toBe(response);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shipping-methods'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('sends a POST request', async () => {
    const response = new Response('Created', { status: 201 });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);

    await api.post('/shipments', newShipment);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shipments'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShipment),
      }),
    );
  });

  it('throws an error for HTTP errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 404 }));

    await expect(api.get('/shipping-methods')).rejects.toThrow('Request failed with status 404');
  });

  it('throws an error for network errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(api.get('/shipping-methods')).rejects.toThrow('Failed to fetch');
  });
});
// #endregion
