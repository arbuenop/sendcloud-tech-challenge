import type { ShippingMethod } from '../../../../shared/types';
import { getRequiredElement } from '../../../../shared/dom';

export type ShippingMethodsState = 'loading' | 'ready' | 'error';

const SHIPPING_METHODS_LOGO_PATH =
  'M84.4 76.4l6-5a2.5 2.5 0 0 0 .8-2V49.3a1 1 0 0 0-.6-.9L70.8 38a2.5 2.5 0 0 0-2.4 0L49 48a.8.8 0 0 0-.5.8l.2 21.8a2.3 2.3 0 0 0 .9 1.8 88.8 88.8 0 0 0 22 12.3 70.4 70.4 0 0 0 37.8 4.7c5.5-1 11-2 16.3-6.5A28 28 0 0 0 135 65a27 27 0 0 0-4-16.6 29 29 0 0 0-10.4-9.8 29.4 29.4 0 0 0-13.3-3.8 45.3 45.3 0 0 0-5-11.3A38.9 38.9 0 0 0 86.7 9a40.7 40.7 0 0 0-12.1-4 38 38 0 0 0-14.4.5 39.5 39.5 0 0 0-11.3 4.7A34.3 34.3 0 0 0 37 21.1a32.4 32.4 0 0 0-5 15 31 31 0 0 0-14.4 4.2A26.3 26.3 0 0 0 6.8 51.9 26.6 26.6 0 0 0 5 68.3c.5 2.7 1.8 9.5 7.4 14.6 2.1 1.9 5.2 3.9 10.9 5.3 8.9 2.7 34.3 2.7 37.6-3.5';

function getPreferenceValue(method: ShippingMethod): string {
  return method.name
    .replace(/\s+shipping method$/i, '')
    .trim()
    .toLowerCase();
}

/**
 * I moved this rendering logics into a separated function to keep the rest of the code clean.
 *
 * @param wrapper - The element where to draw the cloud loader
 */
function renderShippingMethodsSkeleton(wrapper: HTMLDivElement): void {
  const loading = document.createElement('div');
  loading.className = 'shipping-methods-loading';
  loading.setAttribute('role', 'status');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', 'shipping-methods-loading-cloud');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', '0 0 139.5 94.8');
  svg.setAttribute('class', 'bootup-loading-logo');
  svg.setAttribute('aria-hidden', 'true');

  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  background.setAttribute('class', 'bootup-loading-logo__bg');
  background.setAttribute('d', SHIPPING_METHODS_LOGO_PATH);
  const foreground = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  foreground.setAttribute('class', 'bootup-loading-logo__fg');
  foreground.setAttribute('pathLength', '100');
  foreground.setAttribute('d', SHIPPING_METHODS_LOGO_PATH);
  group.append(background, foreground);
  svg.append(group);

  const message = document.createElement('span');
  message.textContent = 'Loading...';
  message.classList = 'bootup-loading-logo__message';
  loading.append(svg, message);
  wrapper.replaceChildren(loading);
}

/**
 * It finds the wrapper element for the shipping methods, or creates it if it doesn't exist yet.
 * In case it creates the wrapper, it will set the aria-busy attribute to true and render skeleton cards.
 *
 * It would be nice to standardize this logic as a shared utility for lazy-loaded content.
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
    wrapper.classList = 'fieldset__radiocardwrapper';
    wrapper.setAttribute('aria-busy', 'true');
    renderShippingMethodsSkeleton(wrapper);
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

  // This act as a label for the radio cards
  const description = document.createElement('span');
  description.classList = 'field__label';
  description.append(document.createTextNode('How would you like your parcel to be shipped?'));

  const radios = methods.map((method) => {
    const label = document.createElement('label');
    label.htmlFor = `shipping-preference-${method.id}`;
    label.classList = `fieldset__radiolabel`;
    const input = document.createElement('input');
    input.type = 'radio';
    input.id = label.htmlFor;
    input.classList = `fieldset__radioinput`;
    input.name = 'shipping_preference';
    input.value = getPreferenceValue(method);
    label.append(
      input,
      document.createTextNode(method.name.replace(/\s*shipping method/i, '').trim()),
    );
    return label;
  });

  if (radios.length === 0) {
    throw new Error('The shipping methods response did not contain any methods');
  }

  wrapper.replaceChildren(description, ...radios);
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
  renderShippingMethodsSkeleton(wrapper);
  removeShippingError(form);
}

export function setShippingMethodsError(form: HTMLFormElement): void {
  const wrapper = getShippingMethodsContainer(form);
  wrapper.setAttribute('aria-busy', 'false');
  wrapper.replaceChildren();

  let error = form.querySelector<HTMLParagraphElement>('#shipping-methods-error');
  if (!error) {
    error = document.createElement('p');
    error.id = 'shipping-methods-error';
    error.className = 'alert alert--large';
    error.setAttribute('role', 'alert');
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.dataset.retryShippingMethods = '';
    retry.textContent = 'Try again';
    retry.classList = 'button button--error';
    error.append(document.createTextNode('Shipping preferences could not be loaded. '), retry);
    wrapper.after(error);
  }
  error.hidden = false;
}

export function removeShippingError(form: HTMLFormElement): void {
  const error = form.querySelector<HTMLParagraphElement>('#shipping-methods-error');
  if (error) error.hidden = true;
}
