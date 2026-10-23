import { getRequiredElement, syncOptionalMarker } from '../../../../shared/dom';
import { requiresCustoms } from '../../schema/schema';

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
  // Selectors
  const country = getRequiredElement<HTMLSelectElement>(form, '#country');
  const fieldset = getRequiredElement<HTMLFieldSetElement>(form, '#customs-fields');
  const visible = requiresCustoms(country.value);

  fieldset.hidden = !visible;
  fieldset.disabled = !visible;

  const describedBy = new Set(
    (country.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean),
  );
  if (describedBy.size > 0) {
    country.setAttribute('aria-describedby', [...describedBy].join(' '));
  } else {
    country.removeAttribute('aria-describedby');
  }

  for (const control of fieldset.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >('input, select, textarea')) {
    control.required =
      visible && (control.name === 'tax_number' || control.name === 'export_reason');
    control.setAttribute('aria-required', String(control.required));
    const label = form.querySelector<HTMLLabelElement>(`label[for="${control.id}"]`);
    syncOptionalMarker(label, control.required);
  }

  return visible;
}
