import { describe, expect, it } from 'vitest';
import type { NewShipment } from './schema';
import { validateAll, validateShipmentField } from './validations';

const DOMESTIC = 'NL';
const CUSTOMS = 'US';

const valid: Partial<NewShipment> = {
  name: 'Alejandro Bueno',
  city: 'Eindhoven',
  country: DOMESTIC,
  shipping_preference: 'cheapest',
  insured: false,
};

describe('validateShipmentField', () => {
  it('skips customs fields for domestic countries', () => {
    expect(validateShipmentField('tax_number', '', DOMESTIC)).toEqual([]);
  });

  it('validates customs fields for customs countries', () => {
    expect(validateShipmentField('tax_number', '', CUSTOMS).length).toBeGreaterThan(0);
  });

  it('validates regular fields', () => {
    expect(validateShipmentField('name', '', DOMESTIC).length).toBeGreaterThan(0);
    expect(validateShipmentField('name', 'Alejandro Bueno', DOMESTIC)).toEqual([]);
  });
});

describe('validateAll', () => {
  it('accepts a valid shipment', () => {
    expect(validateAll(valid).ok).toBe(true);
  });

  it('returns errors per field when data is invalid', () => {
    const result = validateAll({ ...valid, name: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.name?.length).toBeGreaterThan(0);
  });

  it('requires customs fields for customs countries', () => {
    const result = validateAll({ ...valid, country: CUSTOMS });
    expect(result.ok).toBe(false);
  });
});
