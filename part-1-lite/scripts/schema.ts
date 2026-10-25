import * as v from 'valibot';

// #region Constants

const COUNTRIES = [
  { label: 'The Netherlands', value: 'NL' },
  { label: 'France', value: 'FR' },
  { label: 'Germany', value: 'DE' },
  { label: 'Portugal', value: 'PT' },
  { label: 'Spain', value: 'ES' },
  { label: 'Italy', value: 'IT' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'United States of America', value: 'US' },
] as const;

const EXPORT_REASONS = [
  { label: 'Commercial goods', value: 'commercial_goods' },
  { label: 'Gift', value: 'gift' },
  { label: 'Documents', value: 'documents' },
] as const;

const CUSTOMS_COUNTRIES = ['GB', 'US'] as const;

// #endregion

// #region Utils
const requiresCustoms = (country: string): boolean => {
  return CUSTOMS_COUNTRIES.some((customsCountry) => customsCountry === country);
};
// #endregion

// #region Schema

/**
 * This is the Create Shipment schema. It is meant to be the single source of truth for all the form validations when creating a new shipment.
 * It will be used in the controller to validate the form values before submitting them to the API.
 */
const shipmentFieldSchemas = {
  // Name: Required, 1-100 char
  name: v.message(
    v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100)),
    "Enter the recipient's name (max. 100 characters)",
  ),

  // Telephone number: Optional, 7-15 digits, allows +, spaces, hyphens and parentheses
  telephone_number: v.optional(
    v.message(
      v.pipe(
        v.string(),
        v.trim(),
        v.check((value) => {
          if (value === '') return true;
          if (!/^\+?[0-9\s\-()]+$/.test(value)) return false;
          const digits = value.replace(/\D/g, '').length;
          return digits >= 7 && digits <= 15;
        }),
        v.transform((value) => value.replace(/[\s\-()]/g, '')),
      ),
      'Enter a valid phone number',
    ),
  ),

  // Country: Required, must be one of the predefined country values
  country: v.message(
    v.picklist(
      COUNTRIES.map(({ value }) => value) as [
        (typeof COUNTRIES)[number]['value'],
        ...(typeof COUNTRIES)[number]['value'][],
      ],
    ),
    'Choose a country',
  ),

  // City: Required, 1-100 char, trimmed
  city: v.message(
    v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(100)),
    'Enter a city (max. 100 characters)',
  ),

  // Tax number: Optional, 5-20 alphanumeric characters or hyphens, ignores whitespace, normalized to uppercase
  tax_number: v.optional(
    v.message(
      v.pipe(
        v.string(),
        v.trim(),
        v.check((value) => /^[A-Za-z0-9-]{5,20}$/.test(value.replace(/\s/g, ''))),
        v.transform((value) => value.replace(/\s/g, '').toUpperCase()),
      ),
      'Enter a valid tax number (5-20 letters, digits or hyphens)',
    ),
  ),

  // Export reason: Optional, must be one of the predefined export reason values
  export_reason: v.optional(
    v.message(
      v.picklist(
        EXPORT_REASONS.map(({ value }) => value) as [
          (typeof EXPORT_REASONS)[number]['value'],
          ...(typeof EXPORT_REASONS)[number]['value'][],
        ],
      ),
      'Choose an export reason',
    ),
  ),

  // Statements: Optional, max. 500 characters, trimmed
  statements: v.optional(
    v.message(
      v.pipe(v.string(), v.trim(), v.maxLength(500)),
      'Statements exceed the maximum length of 500 characters',
    ),
  ),

  // Shipping preference: Required, non-empty string, trimmed; options are dynamically populated
  shipping_preference: v.message(
    v.pipe(v.string(), v.trim(), v.minLength(1)),
    'Choose a shipping preference',
  ),

  // Insured: Required boolean (true or false)
  insured: v.boolean(),
};

const createShipmentBaseSchema = v.object(shipmentFieldSchemas);

/**
 * Conditional validation is applied to the shipment schema to ensure that customs fields are only required when the country requires customs.
 * The `v.partialCheck` function is used to apply the conditional validation to the `tax_number` and `export_reason` fields.
 * The `v.forward` function is used to forward the validation result of the `shipmentBaseSchema` to the conditional validation.
 * The `requiresCustoms` function is used to determine if the country requires customs.
 */
export const createShipmentSchema = v.pipe(
  createShipmentBaseSchema,
  v.forward(
    v.partialCheck(
      [['country'], ['tax_number']],
      ({ country, tax_number }) => !requiresCustoms(country) || typeof tax_number === 'string',
      'Enter a valid tax number (5-20 letters, digits or hyphens)',
    ),
    ['tax_number'],
  ),
  v.forward(
    v.partialCheck(
      [['country'], ['export_reason']],
      ({ country, export_reason }) =>
        !requiresCustoms(country) || typeof export_reason === 'string',
      'Choose an export reason',
    ),
    ['export_reason'],
  ),
);

// #endregion

export type NewShipment = v.InferOutput<typeof createShipmentSchema>;
export { requiresCustoms, shipmentFieldSchemas, COUNTRIES, EXPORT_REASONS };
