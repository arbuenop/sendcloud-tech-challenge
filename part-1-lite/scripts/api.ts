import type { NewShipment } from './schema';
import { ShippingMethod } from './shipping-methods';

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Retrieves the URL from the environment and ensures it is properly formatted.
 *
 * @returns The base URL of the API.
 * @throws An error if the URL is invalid.
 */
export function getBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl || !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(baseUrl)) {
    throw new Error('Invalid URL');
  }

  return baseUrl.replace(/\/+$/, '');
}

/**
 * Fetches the available shipping methods from the API.
 *
 * @returns A promise that resolves to an array of shipping methods.
 * @throws An error if the response is not a list or contains invalid data.
 */
export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const response = await fetch(`${getBaseUrl()}/shipping-methods`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch shipping methods: ${response.status} ${response.statusText}`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('The shipping methods response was not a list');
  }

  const methods = data.filter(
    (method): method is ShippingMethod =>
      typeof method === 'object' &&
      method !== null &&
      'id' in method &&
      typeof method.id === 'number' &&
      'name' in method &&
      typeof method.name === 'string',
  );

  if (methods.length !== data.length) {
    throw new Error('The shipping methods response contains invalid data');
  }

  return methods;
}

/**
 * Submits shipment form values to the API.
 *
 * The shipment must be validated before calling this function.
 *
 * @param shipment - Validated form values necessary for a shipment.
 */
export async function postShipment(shipment: NewShipment): Promise<void> {
  if (shipment === null || typeof shipment !== 'object') {
    throw new Error('The shipment data collected from the form is not a valid object');
  }

  const response = await fetch(`${getBaseUrl()}/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shipment),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit shipment: ${response.status} ${response.statusText}`);
  }
}
