import { requiresCustoms } from './schema';
/**
 * This function handles the rendering of the customs section of the form based on the selected country.
 * It shows or hides the customs fieldset and updates the required attributes of its controls accordingly.
 *
 * @see requiresCustoms for the validation logic that determines if customs fields are required based on the selected country.
 *
 * @param form - Root form Element
 * @returns
 */
export function syncCustomsSection(form: HTMLFormElement): boolean {
  // Selectprs
  const country = form.elements.namedItem('country');
  const fieldset = form.querySelector<HTMLFieldSetElement>('#customs-fields');
  if (!(country instanceof HTMLSelectElement) || !fieldset) {
    throw new Error('Customs form fields are missing');
  }

  // If the country selected needs info for the customs, then it renders it
  const visible = requiresCustoms(country.value);
  fieldset.hidden = !visible;
  fieldset.disabled = !visible;
  const optionalMarker = form.querySelector<HTMLElement>('[data-tax-optional]');
  if (optionalMarker) optionalMarker.hidden = visible;

  for (const control of fieldset.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >('input, select, textarea')) {
    control.required =
      visible && (control.name === 'tax_number' || control.name === 'export_reason');
    control.setAttribute('aria-required', String(control.required));
  }

  return visible;
}
