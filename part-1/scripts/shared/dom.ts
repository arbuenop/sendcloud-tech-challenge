/**
 * This function is a utility to get a required element from the DOM.
 * It will throw an error if the element is not found, which helps to catch issues early.
 *
 * @param parent - Element where to search
 * @param selector - Query to select elements within.
 * @returns The selected element
 * @throws Error if the element is not found
 */
export function getRequiredElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector<T>(selector);
  if (!element) throw new Error(`Required form element not found: ${selector}`);
  return element;
}

/**
 * Returns the selected element ensuring that it is a form field.
 *
 * @param form - Root form Element
 * @param name - Field name
 * @returns
 */
export function getFieldElement(
  form: HTMLFormElement,
  name: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  const element = form.elements.namedItem(name);
  if (element instanceof RadioNodeList) {
    return (
      Array.from(element).find(
        (radio): radio is HTMLInputElement => radio instanceof HTMLInputElement && radio.checked,
      ) ??
      Array.from(element).find(
        (radio): radio is HTMLInputElement => radio instanceof HTMLInputElement,
      ) ??
      null
    );
  }
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element;
  }
  return null;
}

/**
 * Returns the selected element ensuring that they are form fields.
 *
 * @param form - Root form Element
 * @param name - Field name
 * @returns
 */
export function getFieldElements(
  form: HTMLFormElement,
  name: string,
): Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  const element = form.elements.namedItem(name);
  if (element instanceof RadioNodeList) {
    return Array.from(element).filter(
      (control): control is HTMLInputElement =>
        control instanceof HTMLInputElement && control.type === 'radio',
    );
  }

  const control = getFieldElement(form, name);
  return control ? [control] : [];
}

/**
 * Updates the DOM to reflect whether a field is required or optional.
 * It adds or removes an optional marker in the label accordingly.
 *
 * @param label - The label element that may contain an optional marker.
 * @param isRequired - Whether the associated field is required or not.
 * @returns
 */
export function syncOptionalMarker(label: HTMLLabelElement | null, isRequired: boolean): void {
  const marker = label?.querySelector<HTMLElement>('[data-optional-marker]');
  if (!label) return;

  if (!isRequired && !marker) {
    const optionalMarker = document.createElement('span');
    optionalMarker.dataset.optionalMarker = '';
    optionalMarker.classList = 'field__optionalmarker';
    optionalMarker.textContent = ' (Optional)';
    label.append(optionalMarker);
  } else if (isRequired && marker) {
    marker.remove();
  }
}
