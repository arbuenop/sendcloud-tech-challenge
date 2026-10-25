import * as v from 'valibot';
import { requiresCustoms, createShipmentSchema } from './schema';
import type { NewShipment } from './schema';

export type FieldErrors<FieldName extends string> = Partial<Record<FieldName, string[]>>;
export type ValidationResult<ValidationSchema> =
  | { ok: true; data: ValidationSchema }
  | { ok: false; errors: FieldErrors<Extract<keyof ValidationSchema, string>> };

const FIELD_NAMES: readonly string[] = [
  'name',
  'telephone_number',
  'country',
  'city',
  'tax_number',
  'export_reason',
  'statements',
  'shipping_preference',
];

function cleanOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * This function gets the raw values from the form and performs a bunch of validations to ensure no dirty or incorrect data is
 * shipped to the API.
 *
 * @param raw - Raw values straight from the form
 * @returns validation result @see ValidationResult to know the shape of the returned data
 */
export function validateAll(raw: Partial<NewShipment>): ValidationResult<NewShipment> {
  // Check if the selected country requires additional info
  const customs = requiresCustoms(raw.country!);

  // If we don't do that, then a validation error will ocur in these fields because the lenght would be 0 instead of not having value
  const telephoneNumber = cleanOptional(raw.telephone_number!);
  const taxNumber = customs ? cleanOptional(raw.tax_number!) : undefined;
  const exportReason = customs ? cleanOptional(raw.export_reason!) : undefined;
  const statements = customs ? cleanOptional(raw.statements!) : undefined;

  // Format data so the schema can validate it.
  const candidate = {
    name: raw.name,
    ...(telephoneNumber ? { telephone_number: telephoneNumber } : {}),
    city: raw.city,
    country: raw.country,
    ...(customs
      ? {
          ...(taxNumber ? { tax_number: taxNumber } : {}),
          ...(exportReason ? { export_reason: exportReason } : {}),
          ...(statements ? { statements } : {}),
        }
      : {}),
    shipping_preference: raw.shipping_preference,
    insured: raw.insured,
  };

  // Valibot doing it's wonders...
  const result = v.safeParse(createShipmentSchema, candidate);

  if (result.success) return { ok: true, data: result.output };

  // Format validation errors for the form alert.
  const errors: FieldErrors<keyof NewShipment> = {};
  for (const issue of result.issues) {
    const field = issue.path?.[0]?.key;
    if (typeof field !== 'string' || !FIELD_NAMES.includes(field)) continue;

    const name = field as keyof NewShipment;
    const fieldErrors = errors[name] ?? [];
    if (!fieldErrors.includes(issue.message)) fieldErrors.push(issue.message);
    errors[name] = fieldErrors;
  }

  // Very rare use case, but let's catch it just in case.
  if (Object.keys(errors).length === 0) {
    throw new Error('Shipment validation failed without a field-specific issue');
  }

  return { ok: false, errors };
}
