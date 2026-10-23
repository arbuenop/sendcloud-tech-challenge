import { describe, it, expect, vi, afterEach } from 'vitest';
import { api } from '../../../api/client';
import { getShippingMethods, postShipment } from './endpoints';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getShippingMethods', () => {
  it('throws an error if the response is not a list', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      json: async () => ({ id: 1, name: 'Standard' }),
    } as Response);

    await expect(getShippingMethods()).rejects.toThrow(
      'The shipping methods response was not a list',
    );
  });

  it('throws an error if the response contains invalid data', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      json: async () => [{ id: 'invalid', name: 'Standard' }],
    } as Response);

    await expect(getShippingMethods()).rejects.toThrow(
      'The shipping methods response contains invalid data',
    );
  });
});

describe('postShipment', () => {
  it('throws an error if the shipment is null', () => {
    expect(() => postShipment(null as any)).toThrow(
      'The shipment data collected from the form is not a valid object',
    );
  });

  it('throws an error if the shipment is not an object', () => {
    expect(() => postShipment('invalid' as any)).toThrow(
      'The shipment data collected from the form is not a valid object',
    );
  });
});
