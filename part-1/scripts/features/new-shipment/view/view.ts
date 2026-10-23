import type { FieldErrors, ShippingMethod } from '../../../shared/types';
import {
  clearFieldErrors,
  focusFirstError,
  prepareFieldErrors,
  renderFieldErrors,
} from './utils/errors';
import { syncCustomsSection } from './utils/customs';
import { getFieldElement, getRequiredElement, syncOptionalMarker } from '../../../shared/dom';
import { populateSelectOptions } from './utils/populate-options';
import {
  prepareShippingPreference,
  renderShippingMethods,
  setShippingMethodsError,
  setShippingMethodsLoading,
} from './utils/shipping-methods';
import { NewShipment, COUNTRIES, EXPORT_REASONS, shipmentFieldSchemas } from '../schema/schema';
import { flagOptionalFields } from './utils/flag-optional-fields';

/**
 * Normally this would be a well documented type or prefereably a class with proper documentation on each function.
 * But since this is a quite simple use case and because I already documented everything inside the function itself
 * I've decided to just build the type from the function. However this can be easily replaced whenever, even by a proper class.
 */
export type NewShipmentView = ReturnType<typeof createNewShipmentView>;

/**
 * Creates and initializes a view object that provides methods to interact with the "New Shipment" form.
 * This is our "Javascript representation" of the form. This is needed to handle events like onBlur, onFocus
 * which are very valuable from a UX perspective.
 *
 * This function is meant to be used by the controller to connect the different UI elements to the API.
 *
 * Having this component separated from the controller makes this implementation JS-framework agnostic, and allows us to test the controller without having to render the form in a browser.
 *
 * Besides linking the form to the controller, this function also handles some basic rendering of the form, like populating select options, preparing the shipping preference radio buttons, and preparing the field errors.
 *
 * @returns An object with methods to read values, reset the form, bind event handlers, sync customs section, clear errors, focus on the first error, set shipping loading state, show shipping methods, set submitting state, and show success or error messages.
 */
export function createNewShipmentView() {
  // #region Element Selectors
  const form = getRequiredElement<HTMLFormElement>(document, '#shipment-form');
  const submitButton = getRequiredElement<HTMLButtonElement>(form, 'button[type="submit"]');
  const successMessage = getRequiredElement<HTMLParagraphElement>(document, '#form-success');
  const errorMessage = getRequiredElement<HTMLParagraphElement>(document, '#form-error');
  const customsFieldset = getRequiredElement<HTMLFieldSetElement>(form, '#customs-fields');
  // #endregion

  // #region DOM rendering utils
  populateSelectOptions(form);
  prepareShippingPreference(form);
  prepareFieldErrors(form);
  flagOptionalFields(form);
  // #endregion

  // #region Event Listeners
  let fieldBlurHandler: ((name: keyof NewShipment) => void) | undefined;
  let fieldInputHandler: ((name: keyof NewShipment) => void) | undefined;
  let fieldChangeHandler: ((name: keyof NewShipment) => void) | undefined;
  let submitHandler: ((event: SubmitEvent) => void) | undefined;
  let retryHandler: (() => void) | undefined;

  /**
   * Ensures that the event target is an input, select, or textarea element and returns its name if it is a valid field in the NewShipment type.
   *
   * @param target - Field element we want to know the name of
   * @returns
   */
  function fieldName(target: EventTarget | null): keyof NewShipment | undefined {
    if (!(
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    )) {
      return undefined;
    }

    const name = target.name;
    return [
      'name',
      'telephone_number',
      'country',
      'city',
      'tax_number',
      'export_reason',
      'statements',
      'shipping_preference',
    ].includes(name)
      ? (name as keyof NewShipment)
      : undefined;
  }

  form.addEventListener('focusout', (event) => {
    const name = fieldName(event.target);
    if (name) fieldBlurHandler?.(name);
  });
  form.addEventListener('input', (event) => {
    const name = fieldName(event.target);
    if (name) fieldInputHandler?.(name);
  });
  form.addEventListener('change', (event) => {
    const name = fieldName(event.target);
    if (name) {
      if (name === 'country') syncCustomsSection(form);
      fieldChangeHandler?.(name);
    }
  });
  form.addEventListener('submit', (event) => submitHandler?.(event));
  form.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-retry-shipping-methods]')) {
      retryHandler?.();
    }
  });
  // #endregion

  // #region Form functions
  function readValues(): NewShipment {
    const read = (name: keyof NewShipment): string => getFieldElement(form, name)?.value ?? '';
    const insured = getFieldElement(form, 'insured');
    const insuredChecked =
      insured instanceof HTMLInputElement && insured.type === 'checkbox' ? insured.checked : false;

    return {
      name: read('name'),
      telephone_number: read('telephone_number'),
      country: read('country') as (typeof COUNTRIES)[number]['value'],
      city: read('city'),
      tax_number: read('tax_number'),
      export_reason: read('export_reason') as (typeof EXPORT_REASONS)[number]['value'],
      statements: read('statements'),
      shipping_preference:
        form.querySelector<HTMLInputElement>('input[name="shipping_preference"]:checked')?.value ??
        '',
      insured: insuredChecked,
    };
  }

  function clearStatus(): void {
    successMessage.hidden = true;
    errorMessage.hidden = true;
    successMessage.textContent = '';
    errorMessage.textContent = '';
  }
  // #endregion

  return {
    readValues,
    resetForm(): void {
      form.reset();
    },
    bindHandlers(handlers: {
      onBlur: (name: keyof NewShipment) => void;
      onInput: (name: keyof NewShipment) => void;
      onChange: (name: keyof NewShipment) => void;
      onSubmit: (event: SubmitEvent) => void;
      onRetryShippingMethods: () => void;
    }): void {
      fieldBlurHandler = handlers.onBlur;
      fieldInputHandler = handlers.onInput;
      fieldChangeHandler = handlers.onChange;
      submitHandler = handlers.onSubmit;
      retryHandler = handlers.onRetryShippingMethods;
    },
    syncCustoms(): boolean {
      return syncCustomsSection(form);
    },
    clearCustomsErrors(): void {
      if (customsFieldset.hidden) {
        renderFieldErrors(form, {
          tax_number: [],
          export_reason: [],
          statements: [],
        });
      }
    },
    renderErrors(errors: FieldErrors<keyof NewShipment>): void {
      renderFieldErrors(form, errors);
    },
    clearErrors(): void {
      clearFieldErrors(form);
    },
    focusFirstError(errors: FieldErrors<keyof NewShipment>): void {
      focusFirstError(form, errors);
    },
    setShippingLoading(): void {
      setShippingMethodsLoading(form);
    },
    // Not Implemented
    setShippingError(): void {
      setShippingMethodsError(form);
    },
    showShippingMethods(methods: readonly ShippingMethod[]): void {
      renderShippingMethods(form, methods);
      flagOptionalFields(form);
      prepareFieldErrors(form);
    },
    setSubmitting(submitting: boolean): void {
      submitButton.setAttribute('aria-disabled', String(submitting));
      submitButton.textContent = submitting ? 'Submitting…' : 'Submit';
    },
    showSuccess(message: string): void {
      clearStatus();
      successMessage.textContent = message;
      successMessage.hidden = false;
      successMessage.focus();
    },
    showError(message: string): void {
      clearStatus();
      errorMessage.textContent = message;
      errorMessage.hidden = false;
      errorMessage.focus();
    },
  };
}
