import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import { COUNTRIES, EXPORT_REASONS, shipmentFieldSchemas } from '../../schema';

const parse = (field: keyof typeof shipmentFieldSchemas, value: unknown) =>
  v.safeParse(shipmentFieldSchemas[field], value);

describe('text fields (name, city)', () => {
  it.each(['name', 'city'] as const)('%s trims and enforces 1-100 characters', (field) => {
    const trimmed = parse(field, '  Ana  ');
    expect(trimmed.success).toBe(true);
    if (trimmed.success) expect(trimmed.output).toBe('Ana');

    expect(parse(field, '   ').success).toBe(false);
    expect(parse(field, 'a'.repeat(101)).success).toBe(false);
  });
});
describe('textarea field (statements)', () => {
  it('is optional, trims, and enforces a 500 character limit', () => {
    expect(parse('statements', undefined).success).toBe(true);

    const trimmed = parse('statements', '  Handle with care  ');
    expect(trimmed.success).toBe(true);
    if (trimmed.success) expect(trimmed.output).toBe('Handle with care');

    expect(parse('statements', 'a'.repeat(500)).success).toBe(true);
    expect(parse('statements', 'a'.repeat(501)).success).toBe(false);
  });
});
describe('select fields (country, export_reason)', () => {
  it('accepts listed options and rejects anything else', () => {
    expect(parse('country', COUNTRIES[0].value).success).toBe(true);
    expect(parse('country', 'XX').success).toBe(false);

    expect(parse('export_reason', EXPORT_REASONS[0].value).success).toBe(true);
    expect(parse('export_reason', 'other').success).toBe(false);
  });

  it('allows export_reason to be omitted', () => {
    expect(parse('export_reason', undefined).success).toBe(true);
  });
});

describe('radio fields (shipping_preference, insured)', () => {
  it('requires a non-empty shipping preference', () => {
    expect(parse('shipping_preference', 'cheapest').success).toBe(true);
    expect(parse('shipping_preference', '').success).toBe(false);
  });

  it('requires insured to be a boolean', () => {
    expect(parse('insured', true).success).toBe(true);
    expect(parse('insured', 'true').success).toBe(false);
  });
});
