import type { ShippingMethod } from '../../../../shared/types';
import { getRequiredElement } from '../../../../shared/dom';

export type ShippingMethodsState = 'loading' | 'ready' | 'error';

function getPreferenceValue(method: ShippingMethod): string {
  return method.name
    .replace(/\s+shipping method$/i, '')
    .trim()
    .toLowerCase();
}

/**
 * It finds the wrapper element for the shipping methods, or creates it if it doesn't exist yet.
 * In case it creates the wrapper, it will set the aria-busy attribute to true and add a loading message.
 *
 * It would be nice to standarize this kind of logic, so when we have some lazy loading content we could use a utility function to create the wrapper and set the aria-busy attribute and loading message.
 *
 * @param form - The root form element
 * @returns The wrapper element for the shipping methods
 */
function getShippingMethodsContainer(form: HTMLFormElement): HTMLDivElement {
  // Selectors
  const fieldset = getRequiredElement<HTMLFieldSetElement>(form, '#shipping-preference-fieldset');
  let wrapper = fieldset.querySelector<HTMLDivElement>('[data-shipping-methods]');

  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.dataset.shippingMethods = '';
    wrapper.setAttribute('aria-busy', 'true');
    wrapper.textContent = 'Loading shipping methods…';
    fieldset.prepend(wrapper);
  }

  return wrapper;
}

/**
 * This function will ensure that there is a container for the shipping methods prepared for the model to fill in
 * when the shipping methods are loaded from the API.
 *
 * @param form - The root form element
 */
export function prepareShippingPreference(form: HTMLFormElement): void {
  getShippingMethodsContainer(form);
}

export function renderShippingMethods(
  form: HTMLFormElement,
  methods: readonly ShippingMethod[],
): void {
  const wrapper = getShippingMethodsContainer(form);
  const radios = methods.map((method) => {
    const label = document.createElement('label');
    label.htmlFor = `shipping-preference-${method.id}`;
    const input = document.createElement('input');
    input.type = 'radio';
    input.id = label.htmlFor;
    input.name = 'shipping_preference';
    input.value = getPreferenceValue(method);
    label.append(input, document.createTextNode(method.name));
    return label;
  });

  if (radios.length === 0) {
    throw new Error('The shipping methods response did not contain any methods');
  }

  wrapper.replaceChildren(...radios);
  wrapper.removeAttribute('aria-busy');
  removeShippingError(form);
}

/**
 * Shows the loading state while shipping methods are being fetched
 *
 * @param form - The root form element
 */
export function setShippingMethodsLoading(form: HTMLFormElement): void {
  const wrapper = getShippingMethodsContainer(form);
  wrapper.setAttribute('aria-busy', 'true');
  wrapper.textContent = 'Loading shipping methods…';
  removeShippingError(form);
}

export function setShippingMethodsError(form: HTMLFormElement): void {
  const wrapper = getShippingMethodsContainer(form);
  wrapper.setAttribute('aria-busy', 'false');

  let error = form.querySelector<HTMLParagraphElement>('#shipping-methods-error');
  if (!error) {
    error = document.createElement('p');
    error.id = 'shipping-methods-error';
    error.className = 'field-error';
    error.setAttribute('role', 'alert');
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.dataset.retryShippingMethods = '';
    retry.textContent = 'Retry loading shipping methods';
    error.append(document.createTextNode('Shipping preferences could not be loaded. '), retry);
    wrapper.after(error);
  }
  error.hidden = false;
}

export function removeShippingError(form: HTMLFormElement): void {
  const error = form.querySelector<HTMLParagraphElement>('#shipping-methods-error');
  if (error) error.hidden = true;
}
