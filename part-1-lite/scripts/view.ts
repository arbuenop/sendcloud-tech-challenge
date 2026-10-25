import { syncCustomsSection } from './customs';
import {
  renderShippingMethods,
  setShippingMethodsError,
  setShippingMethodsLoading,
  ShippingMethod,
} from './shipping-methods';
import type { NewShipment } from './schema';
import type { FieldErrors } from './validations';

/**
 * Normally this would be a well documented type or prefereably a class with proper documentation on each function.
 * But since this is a quite simple use case and because I already documented everything inside the function itself
 * I've decided to just build the type from the function. However this can be easily replaced whenever, even by a proper class.
 */
export type NewShipmentView = ReturnType<typeof createNewShipmentView>;

/**
 * This function is a utility to ensure that we get a specific element from the DOM.
 * It will throw an error if the element is not found, which helps to catch issues early.
 *
 * @param parent - Element where to search
 * @param selector - Query to select elements within.
 * @returns The selected element
 * @throws Error if the element is not found
 */
function requiredElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector<T>(selector);
  if (!element) throw new Error(`Required shipment form element not found: ${selector}`);
  return element;
}

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
  const form = requiredElement<HTMLFormElement>(document, '#shipment-form');
  const submitButton = requiredElement<HTMLButtonElement>(form, 'button[type="submit"]');
  const successMessage = requiredElement<HTMLParagraphElement>(document, '#form-success');
  const errorMessage = requiredElement<HTMLDivElement>(document, '#form-error');
  const shippingFieldset = requiredElement<HTMLFieldSetElement>(
    form,
    '#shipping-preference-fieldset',
  );
  // #endregion

  // #region Prepare the container for the Shipping methods
  const methodsContainer = document.createElement('div');
  methodsContainer.className = 'fieldset__radiocardwrapper';
  methodsContainer.dataset.shippingMethods = '';
  methodsContainer.setAttribute('aria-busy', 'true');
  shippingFieldset.prepend(methodsContainer);
  // #endregion

  // #region Form utils
  let submitHandler: ((event: SubmitEvent) => void) | undefined;
  let retryHandler: (() => void) | undefined;

  function clearFieldErrors(): void {
    for (const error of form.querySelectorAll<HTMLParagraphElement>('.field__error')) {
      error.remove();
    }
    for (const control of form.querySelectorAll<HTMLElement>('[aria-invalid="true"]')) {
      control.removeAttribute('aria-invalid');
      const describedBy = (control.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter((id) => id && !id.endsWith('-error'));
      if (describedBy.length) control.setAttribute('aria-describedby', describedBy.join(' '));
      else control.removeAttribute('aria-describedby');
    }
  }

  function clearStatus(): void {
    successMessage.hidden = true;
    errorMessage.hidden = true;
    successMessage.textContent = '';
    errorMessage.textContent = '';
    clearFieldErrors();
  }
  // #endregion

  // #region Event listener (on submit do the call and check the country selected on change)
  form.addEventListener('submit', (event) => submitHandler?.(event));
  form.addEventListener('change', (event) => {
    if (event.target instanceof HTMLSelectElement && event.target.name === 'country') {
      syncCustomsSection(form);
    }
  });
  form.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-retry-shipping-methods]')) {
      retryHandler?.();
    }
  });
  // #endregion

  return {
    /**
     * Functions to handle the form values
     */
    readValues(): NewShipment {
      const values = new FormData(form);
      return {
        name: String(values.get('name') ?? ''),
        telephone_number: String(values.get('telephone_number') ?? ''),
        country: String(values.get('country') ?? '') as NewShipment['country'],
        city: String(values.get('city') ?? ''),
        tax_number: String(values.get('tax_number') ?? ''),
        export_reason: String(values.get('export_reason') ?? '') as NewShipment['export_reason'],
        statements: String(values.get('statements') ?? ''),
        shipping_preference: String(
          values.get('shipping_preference') ?? '',
        ) as NewShipment['shipping_preference'],
        insured: values.has('insured'),
      };
    },
    resetForm(): void {
      form.reset();
    },
    bindHandlers(handlers: {
      onSubmit: (event: SubmitEvent) => void;
      onRetryShippingMethods: () => void;
    }): void {
      submitHandler = handlers.onSubmit;
      retryHandler = handlers.onRetryShippingMethods;
    },
    syncCustoms: () => syncCustomsSection(form),

    /**
     * Functions to handle the validation errors in the fields
     */
    clearErrors(): void {
      clearStatus();
    },
    showValidationErrors(errors: FieldErrors<keyof NewShipment>): void {
      clearStatus();
      let firstInvalidControl: HTMLElement | undefined;
      for (const [name, messages] of Object.entries(errors)) {
        if (!messages?.length) continue;

        const controls = form.querySelectorAll<HTMLElement>(`[name="${name}"]`);
        const firstControl = controls[0];
        if (!firstControl) continue;

        const errorId = `${name}-error`;
        const error = document.createElement('p');
        error.id = errorId;
        error.className = 'field__error';
        error.textContent = messages.join(' ');
        if (name === 'shipping_preference') {
          methodsContainer.append(error);
        } else {
          const field = firstControl.closest('.field') ?? firstControl.closest('fieldset');
          field?.append(error);
        }

        for (const control of controls) {
          control.setAttribute('aria-invalid', 'true');
          const describedBy = new Set(
            (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean),
          );
          describedBy.add(errorId);
          control.setAttribute('aria-describedby', [...describedBy].join(' '));
        }
        firstInvalidControl ??= firstControl;
      }
      firstInvalidControl?.focus();
    },

    /**
     * Shipping methods functions
     */
    setShippingLoading: () => setShippingMethodsLoading(form, methodsContainer),
    showShippingMethods: (methods: readonly ShippingMethod[]) =>
      renderShippingMethods(form, methodsContainer, methods),
    setShippingError: () => setShippingMethodsError(form, methodsContainer),

    /**
     * Form status events
     */
    setSubmitting(submitting: boolean): void {
      submitButton.disabled = submitting;
      submitButton.setAttribute('aria-disabled', String(submitting));
      submitButton.textContent = submitting ? 'Submitting...' : 'Create shipment';
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
