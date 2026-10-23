import { api } from '../../../api/client';
import type { ShippingMethod } from '../../../shared/types';

/**
 * Fetches the available shipping methods from the API.
 *
 * @returns A promise that resolves to an array of shipping methods.
 * @throws An error if the response is not a list or contains invalid data.
 */
export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const response = await api.get('/shipping-methods');
  const payload: unknown = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error('The shipping methods response was not a list');
  }

  const methods = payload.filter(
    (method): method is ShippingMethod =>
      typeof method === 'object' &&
      method !== null &&
      'id' in method &&
      typeof method.id === 'number' &&
      'name' in method &&
      typeof method.name === 'string',
  );

  if (methods.length !== payload.length) {
    throw new Error('The shipping methods response contains invalid data');
  }

  return methods;
}

/**
 * Submits a shipment form values to the API.
 * This function will only validate if the body is a valid JSON object, but it will not validate the values of the shipment form.
 * that is the responsibility of the validation schema.
 * The api does not validate the values, so they must be validated before calling this function.
 *
 * @param shipment - Form values necessary for a shipment. THEY MUST BE VALIDATED
 */
export function postShipment(
  shipment: object, //!TODO: To be replaced with the infered type of the shipment form values once the schema is implemented
): Promise<Response> {
  if (shipment === null || typeof shipment !== 'object') {
    throw new Error('The shipment data collected from the form is not a valid object');
  }

  return api.post('/shipments', shipment);
}
