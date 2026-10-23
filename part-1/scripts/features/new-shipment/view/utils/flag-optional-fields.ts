import { syncOptionalMarker } from '../../../../shared/dom';
import { shipmentFieldSchemas } from '../../schema/schema';

/**
 * Flags the optional fields in the form by setting the required attribute and aria-required attribute on the input elements,
 * and updating the label to indicate that the field is optional.
 *
 * @param form - Root form element
 */
export function flagOptionalFields(form: HTMLFormElement): void {
  for (const [name, schema] of Object.entries(shipmentFieldSchemas)) {
    const field = form.elements.namedItem(name);
    const controls = field instanceof RadioNodeList ? Array.from(field) : field ? [field] : [];
    const isRequired = schema.type !== 'optional';

    for (const control of controls) {
      if (!(
        control instanceof HTMLInputElement ||
        control instanceof HTMLSelectElement ||
        control instanceof HTMLTextAreaElement
      )) {
        continue;
      }

      control.required = isRequired;
      control.setAttribute('aria-required', String(isRequired));
      const label =
        form.querySelector<HTMLLabelElement>(`label[for="${control.id}"]`) ??
        control.closest('label');
      syncOptionalMarker(label, isRequired);
    }
  }
}
