import { beforeEach, describe, expect, it, vi } from 'vitest';
import html from '../../../../new-shipment.html?raw';
import { createNewShipmentView } from './view';

const element = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;

beforeEach(() => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.documentElement.lang = parsed.documentElement.lang;
  document.body.innerHTML = parsed.body.innerHTML;
});

describe('new shipment view', () => {
  it('initializes country/export options and marks required and optional fields', () => {
    const view = createNewShipmentView();

    expect(element<HTMLSelectElement>('#country').options).toHaveLength(9);
    expect(element<HTMLSelectElement>('#export_reason').options).toHaveLength(4);
    expect(element<HTMLInputElement>('#name').required).toBe(true);
    expect(element<HTMLInputElement>('#telephone_number').required).toBe(false);
    expect(element('label[for="telephone_number"] [data-optional-marker]')).not.toBeNull();
    expect(view.syncCustoms()).toBe(false);

    element<HTMLSelectElement>('#country').value = 'GB';
    expect(view.syncCustoms()).toBe(true);
    expect(element<HTMLFieldSetElement>('#customs-fields').hidden).toBe(false);
    expect(element<HTMLInputElement>('#tax_number').required).toBe(true);
    expect(element<HTMLSelectElement>('#export_reason').required).toBe(true);
    expect(element<HTMLTextAreaElement>('#statements').required).toBe(false);
    expect(element('label[for="tax_number"] [data-optional-marker]')).toBeNull();
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

  it('renders, focuses, and clears field errors', () => {
    const view = createNewShipmentView();
    const name = element<HTMLInputElement>('#name');

    view.renderErrors({ name: ['Enter a name'] });
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(element('#name-error').textContent).toBe('Enter a name');
    view.focusFirstError({ name: ['Enter a name'] });
    expect(document.activeElement).toBe(name);

    view.clearErrors();
    expect(name.hasAttribute('aria-invalid')).toBe(false);
    expect(element<HTMLParagraphElement>('#name-error').hidden).toBe(true);

    view.renderErrors({ tax_number: ['Required'], export_reason: ['Required'] });
    element<HTMLSelectElement>('#country').value = 'NL';
    view.syncCustoms();
    view.clearCustomsErrors();
    expect(element<HTMLParagraphElement>('#tax_number-error').hidden).toBe(true);
    expect(element<HTMLParagraphElement>('#export_reason-error').hidden).toBe(true);
  });

  it('binds field, submit, and retry events', () => {
    const view = createNewShipmentView();
    const handlers = {
      onBlur: vi.fn(),
      onInput: vi.fn(),
      onChange: vi.fn(),
      onSubmit: vi.fn(),
      onRetryShippingMethods: vi.fn(),
    };
    view.bindHandlers(handlers);

    const name = element<HTMLInputElement>('#name');
    name.dispatchEvent(new Event('focusout', { bubbles: true }));
    name.dispatchEvent(new Event('input', { bubbles: true }));
    name.dispatchEvent(new Event('change', { bubbles: true }));
    expect(handlers.onBlur).toHaveBeenCalledWith('name');
    expect(handlers.onInput).toHaveBeenCalledWith('name');
    expect(handlers.onChange).toHaveBeenCalledWith('name');

    const country = element<HTMLSelectElement>('#country');
    country.value = 'GB';
    country.dispatchEvent(new Event('change', { bubbles: true }));
    expect(element<HTMLFieldSetElement>('#customs-fields').hidden).toBe(false);
    expect(handlers.onChange).toHaveBeenCalledWith('country');

    element('#shipment-form').dispatchEvent(new Event('submit', { bubbles: true }));
    view.setShippingError();
    element<HTMLButtonElement>('[data-retry-shipping-methods]').click();
    expect(handlers.onSubmit).toHaveBeenCalledOnce();
    expect(handlers.onRetryShippingMethods).toHaveBeenCalledOnce();
  });

  it('renders shipping, submitting, and status states', () => {
    const view = createNewShipmentView();
    view.setShippingLoading();
    const shippingMethods = element('[data-shipping-methods]');
    expect(shippingMethods.querySelector('.bootup-loading-logo')).not.toBeNull();
    expect(shippingMethods.textContent).toContain('Loading...');
    expect(shippingMethods.querySelectorAll('.fieldset__radiocardskeleton')).toHaveLength(0);
    expect(shippingMethods.getAttribute('aria-busy')).toBe('true');

    view.setShippingError();
    expect(element<HTMLParagraphElement>('#shipping-methods-error').hidden).toBe(false);
    expect(shippingMethods.querySelectorAll('.fieldset__radiocardskeleton')).toHaveLength(0);
    view.showShippingMethods([{ id: 1, name: 'Fast shipping method' }]);
    expect(element<HTMLParagraphElement>('#shipping-methods-error').hidden).toBe(true);
    expect(shippingMethods.querySelectorAll('.fieldset__radiocardskeleton')).toHaveLength(0);
    expect(element<HTMLInputElement>('#shipping-preference-1').required).toBe(true);

    const button = element<HTMLButtonElement>('button[type="submit"]');
    view.setSubmitting(true);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.textContent).toBe('Submitting…');
    view.setSubmitting(false);
    expect(button.getAttribute('aria-disabled')).toBe('false');

    view.showSuccess('Created');
    expect(element<HTMLParagraphElement>('#form-success').hidden).toBe(false);
    expect(element<HTMLParagraphElement>('#form-success').textContent).toBe('Created');
    view.showError('Failed');
    expect(element<HTMLParagraphElement>('#form-success').hidden).toBe(true);
    expect(element<HTMLParagraphElement>('#form-error').textContent).toBe('Failed');
  });
});
