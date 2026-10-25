import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import { createShipmentSchema, requiresCustoms, shipmentFieldSchemas } from './schema';

const valid = {
  name: 'Alejandro Bueno',
  city: 'Eindhoven',
  country: 'NL',
  shipping_preference: 'cheapest',
  insured: false,
};

describe('requiresCustoms', () => {
  it('is true for GB and US only', () => {
    expect(requiresCustoms('GB')).toBe(true);
    expect(requiresCustoms('US')).toBe(true);
    expect(requiresCustoms('NL')).toBe(false);
  });
});

describe('telephone_number', () => {
  const parse = (value: string) => v.safeParse(shipmentFieldSchemas.telephone_number, value);

  it('accepts a valid number and strips formatting', () => {
    const result = parse('+31 (6) 1234-5678');
    expect(result.success).toBe(true);
    if (result.success) expect(result.output).toBe('+31612345678');
  });

  it('accepts an empty value', () => {
    expect(parse('').success).toBe(true);
  });

  it('rejects invalid characters and wrong digit counts', () => {
    expect(parse('abc').success).toBe(false);
    expect(parse('123').success).toBe(false);
    expect(parse('1'.repeat(16)).success).toBe(false);
  });
});

describe('tax_number', () => {
  const parse = (value: string) => v.safeParse(shipmentFieldSchemas.tax_number, value);

  it('normalizes a valid tax number', () => {
    const result = parse('ab 123-45');
    expect(result.success).toBe(true);
    if (result.success) expect(result.output).toBe('AB123-45');
  });

  it('rejects values that are too short', () => {
    expect(parse('AB1').success).toBe(false);
  });
});

describe('createShipmentSchema', () => {
  it('accepts a domestic shipment without customs fields', () => {
    expect(v.safeParse(createShipmentSchema, valid).success).toBe(true);
  });

  it('requires tax number and export reason for customs countries', () => {
    const result = v.safeParse(createShipmentSchema, { ...valid, country: 'US' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.issues.map((issue) => issue.path?.[0]?.key);
      expect(fields).toEqual(expect.arrayContaining(['tax_number', 'export_reason']));
    }
  });

  it('accepts a customs shipment with all customs fields', () => {
    const result = v.safeParse(createShipmentSchema, {
      ...valid,
      country: 'US',
      tax_number: 'AB12345',
      export_reason: 'gift',
    });
    expect(result.success).toBe(true);
  });
});
