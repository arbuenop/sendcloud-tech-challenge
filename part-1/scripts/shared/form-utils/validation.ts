import * as v from 'valibot';

/**
 * It returns a string array with all the issues (if any).
 * If no issues are detected, it returns an empty array.
 *
 * @param schema - validation schema
 * @param value - raw value
 * @returns an array of issues if there is any problem
 */
export function validateField(schema: v.GenericSchema, value: unknown): string[] {
  const result = v.safeParse(schema, value);
  if (result.success) return [];
  return [...new Set(result.issues.map((issue) => issue.message))];
}

/**
 * It converts the empty strings into undefined.
 * This utility is meant to be used when we want to validate an optional field but the schema has a minimum length.
 * If the user writes something and then removes it, the remaining value is an empty string, not an undefined. so it breaks.
 *
 * @param value - raw value
 * @returns the formatted value
 */
export function cleanOptional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}
