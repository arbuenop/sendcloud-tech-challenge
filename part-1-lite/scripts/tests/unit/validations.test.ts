import { describe, expect, it } from 'vitest';
import { validateAll } from '../../validations';
import type { NewShipment } from '../../schema';

const validShipment: Partial<NewShipment> = {
  name: 'Jane Doe',
  telephone_number: '',
  country: 'NL',
  city: 'Eindhoven',
  tax_number: '',
  export_reason: '' as NewShipment['export_reason'],
  statements: '',
  shipping_preference: 'fast',
  insured: false,
};

describe('shipment validation', () => {
  it('accepts a valid shipment and omits empty optional fields', () => {
    const result = validateAll(validShipment);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).not.toHaveProperty('telephone_number');
      expect(result.data).not.toHaveProperty('tax_number');
      expect(result.data).not.toHaveProperty('export_reason');
      expect(result.data).not.toHaveProperty('statements');
    }
  });

  it('returns every required-field error together', () => {
    const result = validateAll({
      ...validShipment,
      name: '',
      country: '' as NewShipment['country'],
      city: '',
      shipping_preference: '',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toMatchObject({
        name: ["Enter the recipient's name (max. 100 characters)"],
        country: ['Choose a country'],
        city: ['Enter a city (max. 100 characters)'],
        shipping_preference: ['Choose a shipping preference'],
      });
    }
  });

  it('requires customs fields only for customs countries', () => {
    const domestic = validateAll(validShipment);
    const international = validateAll({ ...validShipment, country: 'GB' });

    expect(domestic.ok).toBe(true);
    expect(international).toMatchObject({
      ok: false,
      errors: {
        tax_number: ['Enter a valid tax number (5-20 letters, digits or hyphens)'],
        export_reason: ['Choose an export reason'],
      },
    });
  });
});
