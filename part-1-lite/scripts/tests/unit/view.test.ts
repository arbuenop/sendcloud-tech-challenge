import { beforeEach, describe, expect, it, vi } from 'vitest';
import html from '../../../new-shipment.html?raw';
import { createNewShipmentView } from '../../view';

const element = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;

beforeEach(() => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.documentElement.lang = parsed.documentElement.lang;
  document.body.innerHTML = parsed.body.innerHTML;
});

describe('new shipment view', () => {
  it('uses the HTML select options and toggles customs fields with the country', () => {
    createNewShipmentView();

    expect(element<HTMLSelectElement>('#country').options).toHaveLength(9);
    expect(element<HTMLSelectElement>('#export_reason').options).toHaveLength(4);
    expect(element<HTMLSelectElement>('#country').options[1]?.textContent).toBe('The Netherlands');
    expect(element<HTMLSelectElement>('#export_reason').options[1]?.textContent).toBe(
      'Commercial goods',
    );
    expect(element<HTMLFieldSetElement>('#customs-fields').hidden).toBe(true);

    const country = element<HTMLSelectElement>('#country');
    country.value = 'GB';
    country.dispatchEvent(new Event('change', { bubbles: true }));

    expect(element<HTMLFieldSetElement>('#customs-fields').hidden).toBe(false);
    expect(element<HTMLInputElement>('#tax_number').required).toBe(true);
    expect(element<HTMLSelectElement>('#export_reason').required).toBe(true);
    expect(element<HTMLElement>('[data-tax-optional]').hidden).toBe(true);

    country.value = 'NL';
    country.dispatchEvent(new Event('change', { bubbles: true }));
    expect(element<HTMLFieldSetElement>('#customs-fields').hidden).toBe(true);
    expect(element<HTMLElement>('[data-tax-optional]').hidden).toBe(false);
  });

  it('reads and resets form values', () => {
    const view = createNewShipmentView();
    view.showShippingMethods([{ id: 1, name: 'Fast shipping method' }]);
    element<HTMLInputElement>('#name').value = 'Jane Doe';
    element<HTMLInputElement>('#telephone_number').value = '123456789';
    element<HTMLSelectElement>('#country').value = 'NL';
    element<HTMLInputElement>('#city').value = 'Eindhoven';
    element<HTMLInputElement>('#insured').checked = true;
    element<HTMLInputElement>('#shipping-preference-1').checked = true;

    expect(view.readValues()).toEqual({
      name: 'Jane Doe',
      telephone_number: '123456789',
      country: 'NL',
      city: 'Eindhoven',
      tax_number: '',
      export_reason: '',
      statements: '',
      shipping_preference: 'fast',
      insured: true,
    });

    view.resetForm();
    expect(element<HTMLInputElement>('#name').value).toBe('');
    expect(element<HTMLInputElement>('#insured').checked).toBe(false);
    expect(element<HTMLInputElement>('#shipping-preference-1').checked).toBe(false);
  });

  it('does not bind field validation events and submits only through the submit handler', () => {
    const view = createNewShipmentView();
    const onSubmit = vi.fn();
    view.bindHandlers({
      onSubmit,
      onRetryShippingMethods: vi.fn(),
    });

    const name = element<HTMLInputElement>('#name');
    name.dispatchEvent(new Event('focusout', { bubbles: true }));
    name.dispatchEvent(new Event('input', { bubbles: true }));
    name.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onSubmit).not.toHaveBeenCalled();

    element('#shipment-form').dispatchEvent(new Event('submit', { bubbles: true }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('shows validation messages beneath their corresponding fields', () => {
    const view = createNewShipmentView();
    view.showShippingMethods([{ id: 1, name: 'Fast shipping method' }]);

    view.showValidationErrors({
      name: ['Enter a name'],
      country: ['Choose a country'],
      shipping_preference: ['Choose a shipping preference'],
    });

    const alert = element<HTMLDivElement>('#form-error');
    expect(alert.hidden).toBe(true);
    expect(element('#name-error').textContent).toBe('Enter a name');
    expect(element('#country-error').textContent).toBe('Choose a country');
    expect(element<HTMLInputElement>('#name').getAttribute('aria-invalid')).toBe('true');
    expect(element<HTMLSelectElement>('#country').getAttribute('aria-describedby')).toBe(
      'country-error',
    );
    expect(element('#shipping_preference-error').parentElement).toBe(
      element('[data-shipping-methods]'),
    );
    expect(element('#shipping_preference-error').compareDocumentPosition(element('#insured'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    view.clearErrors();
    expect(document.querySelector('#name-error')).toBeNull();
    expect(element<HTMLInputElement>('#name').hasAttribute('aria-invalid')).toBe(false);
  });

  it('renders shipping, submitting, retry, and status states', () => {
    const view = createNewShipmentView();
    const onRetry = vi.fn();
    view.bindHandlers({ onSubmit: vi.fn(), onRetryShippingMethods: onRetry });

    view.setShippingLoading();
    expect(element('[data-shipping-methods]').textContent).toBe('Loading shipping methods...');

    view.setShippingError();
    expect(element<HTMLParagraphElement>('#shipping-methods-error').hidden).toBe(false);
    element<HTMLButtonElement>('[data-retry-shipping-methods]').click();
    expect(onRetry).toHaveBeenCalledOnce();

    view.showShippingMethods([{ id: 1, name: 'Fast shipping method' }]);
    expect(element<HTMLParagraphElement>('#shipping-methods-error').hidden).toBe(true);
    expect(element<HTMLInputElement>('#shipping-preference-1').required).toBe(true);

    const button = element<HTMLButtonElement>('button[type="submit"]');
    view.setSubmitting(true);
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.textContent).toBe('Submitting...');
    view.setSubmitting(false);
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('false');

    view.showSuccess('Created');
    expect(element<HTMLParagraphElement>('#form-success').hidden).toBe(false);
    expect(element<HTMLParagraphElement>('#form-success').textContent).toBe('Created');
    view.showError('Failed');
    expect(element<HTMLParagraphElement>('#form-success').hidden).toBe(true);
    expect(element('#form-error').textContent).toBe('Failed');
  });
});
