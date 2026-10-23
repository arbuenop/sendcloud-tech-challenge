import type { FieldErrors } from '../../../../shared/types';
import {
  clearFormErrors,
  focusFirstFormError,
  prepareFormErrors,
  renderFormErrors,
} from '../../../../shared/form-utils/form-errors';
import { NewShipment } from '../../schema/schema';
/**
 * List of all the fields that can have errors. In this case, we only omit the insurance field.
 */
const FIELD_NAMES: readonly (keyof NewShipment)[] = [
  'name',
  'telephone_number',
  'country',
  'city',
  'tax_number',
  'export_reason',
  'statements',
  'shipping_preference',
];

/**
 * It adds the error boxes under the fields that can have errors, and sets the aria-invalid attribute on those fields.
 *
 * @param form - The root form element
 */
export function prepareFieldErrors(form: HTMLFormElement): void {
  prepareFormErrors(form, FIELD_NAMES);
}

export function renderFieldErrors(
  form: HTMLFormElement,
  errors: FieldErrors<keyof NewShipment>,
): void {
  renderFormErrors(form, errors);
}

export function clearFieldErrors(form: HTMLFormElement): void {
  clearFormErrors(form, FIELD_NAMES);
}

export function focusFirstError(
  form: HTMLFormElement,
  errors: FieldErrors<keyof NewShipment>,
): void {
  focusFirstFormError(form, errors);
}
