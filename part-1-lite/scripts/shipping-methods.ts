export type ShippingMethod = {
  id: number;
  name: string;
};

/**
 * This function takes the form, the shipping methods container and the shipping methods
 * and builds the HTML in the DOM.
 *
 * @param form - Root form element
 * @param container - Wrapper container (where the shipment methods should be)
 * @param methods - Available shipping methods. @see getShippingMethods
 *
 * @throws an error if there are no methods available
 */
export function renderShippingMethods(
  form: HTMLFormElement,
  container: HTMLDivElement,
  methods: readonly ShippingMethod[],
): void {
  if (methods.length === 0) {
    throw new Error('The shipping methods response did not contain any methods');
  }

  const description = document.createElement('span');
  description.className = 'field__label';
  description.textContent = 'How would you like your parcel to be shipped?';

  const options = methods.map((method) => {
    const id = `shipping-preference-${method.id}`;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'fieldset__radiolabel';

    const input = document.createElement('input');
    input.type = 'radio';
    input.id = id;
    input.className = 'fieldset__radioinput';
    input.name = 'shipping_preference';
    input.value = method.name
      .replace(/\s+shipping method$/i, '')
      .trim()
      .toLowerCase();
    input.required = true;
    label.append(input, method.name.replace(/\s*shipping method/i, '').trim());
    return label;
  });

  container.replaceChildren(description, ...options);
  container.removeAttribute('aria-busy');
  clearShippingError(form);
}

/**
 * Shows the loading state while shipping methods are being fetched
 *
 * @param form - The root form element
 * @param container - Wrapper container (where the shipment methods should be)
 */
export function setShippingMethodsLoading(form: HTMLFormElement, container: HTMLDivElement): void {
  container.setAttribute('aria-busy', 'true');
  container.textContent = 'Loading shipping methods...';
  clearShippingError(form);
}

/**
 * Creates the error alert with a retry button if the shipping methods call fails.
 *
 * @param form - The root form element
 * @param container - Wrapper container (where the shipment methods should be)
 */
export function setShippingMethodsError(form: HTMLFormElement, container: HTMLDivElement): void {
  container.setAttribute('aria-busy', 'false');
  container.replaceChildren();

  let error = form.querySelector<HTMLParagraphElement>('#shipping-methods-error');
  if (!error) {
    error = document.createElement('p');
    error.id = 'shipping-methods-error';
    error.className = 'alert alert--large';
    error.setAttribute('role', 'alert');
    error.append('Shipping preferences could not be loaded. ');

    const retry = document.createElement('button');
    retry.type = 'button';
    retry.dataset.retryShippingMethods = '';
    retry.className = 'button button--error';
    retry.textContent = 'Try again';
    error.append(retry);
    container.after(error);
  }
  error.hidden = false;
}

function clearShippingError(form: HTMLFormElement): void {
  const error = form.querySelector<HTMLParagraphElement>('#shipping-methods-error');
  if (error) error.hidden = true;
}
