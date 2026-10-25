import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBaseUrl, getShippingMethods, postShipment } from '../../api';
import type { NewShipment } from '../../schema';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('API', () => {
  it('uses and normalizes the configured base URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/');
    expect(getBaseUrl()).toBe('https://api.example.com');
  });

  it('rejects an invalid base URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'not a URL');
    expect(() => getBaseUrl()).toThrow('Invalid URL');
  });

  it('loads shipping methods and rejects malformed response data', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: 'Fast shipping method' }],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, name: 'Invalid' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'bad', name: 'Invalid' }] });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getShippingMethods()).resolves.toEqual([{ id: 1, name: 'Fast shipping method' }]);
    await expect(getShippingMethods()).rejects.toThrow(
      'The shipping methods response was not a list',
    );
    await expect(getShippingMethods()).rejects.toThrow(
      'The shipping methods response contains invalid data',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/shipping-methods',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('posts a shipment through fetch', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const shipment = {
      name: 'Jane Doe',
      city: 'Eindhoven',
      country: 'NL',
      shipping_preference: 'fast',
      insured: false,
    } as NewShipment;

    await postShipment(shipment);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/shipments',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipment),
        signal: expect.any(AbortSignal),
      }),
    );
  });
});
