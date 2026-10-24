import { getFieldElement, getFieldElements } from '../dom';

export type FormErrors = Partial<Record<string, string[]>>;

/**
 * Prepares the form for error display by creating dedicated error boxes for each field.
 *
 * @param form - root Form Element
 * @param names - list of field names that can have errors
 */
export function prepareFormErrors(form: HTMLFormElement, names: readonly string[]): void {
  for (const name of names) {
    const controls = getFieldElements(form, name);
    if (controls.length === 0) continue;

    const errorId = `${name}-error`;
    let error = form.querySelector<HTMLParagraphElement>(`#${errorId}`);
    if (!error) {
      error = document.createElement('p');
      error.id = errorId;
      error.className = 'field__error';
      error.hidden = true;
      (controls[0]?.closest('div') ?? controls[0]?.parentElement)?.append(error);
    }

    for (const control of controls) {
      const describedBy = new Set(
        (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean),
      );
      describedBy.add(errorId);
      control.setAttribute('aria-describedby', [...describedBy].join(' '));
    }
  }
}

/**
 * Renders form errors by updating the error messages for each field.
 *
 * @param form - Root Form Element
 * @param errors - object containing error messages for each field
 */
export function renderFormErrors(form: HTMLFormElement, errors: FormErrors): void {
  for (const name of Object.keys(errors)) {
    const controls = getFieldElements(form, name);
    const error = form.querySelector<HTMLParagraphElement>(`#${name}-error`);
    if (controls.length === 0 || !error) continue;

    const messages = errors[name] ?? [];
    error.textContent = messages.join(' ');
    error.hidden = messages.length === 0;
    for (const control of controls) {
      if (messages.length > 0) {
        control.setAttribute('aria-invalid', 'true');
      } else {
        control.removeAttribute('aria-invalid');
      }
    }
  }
}

/**
 * Self-descriptive function that clears all form errors for the specified field names.
 *
 * @param form - root Form Element
 * @param names - list of field names that can have errors
 */
export function clearFormErrors(form: HTMLFormElement, names: readonly string[]): void {
  const errors: FormErrors = {};
  for (const name of names) errors[name] = [];
  renderFormErrors(form, errors);
}

/**
 * Finds the first field with an error and focuses on it so the user don't have to manually navigate to it.
 * If no errors are found, it does nothing.
 *
 * @param form - root Form Element
 * @param names - list of field names that can have errors
 * @returns
 */
export function focusFirstFormError(form: HTMLFormElement, errors: FormErrors): void {
  for (const [name, messages] of Object.entries(errors)) {
    if (!messages?.length) continue;
    getFieldElement(form, name)?.focus();
    return;
  }
}
