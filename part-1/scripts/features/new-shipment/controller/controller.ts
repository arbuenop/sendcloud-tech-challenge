import { validateAll, validateShipmentField } from '../schema/validations';
import type { NewShipmentView } from '../view/view';
import type { NewShipment } from '../schema/schema';
import { ShippingMethod } from '../../../shared/types';

type Dependencies = {
  submitShipment: (shipment: NewShipment) => Promise<Response>;
  loadShippingMethods: () => Promise<ShippingMethod[]>;
};

/**
 * Controller that connects the View with the Model/API.
 * Note that the actual implementations of each side (View and API) are sent by parameters, that means that this controller
 * rely on abstractions and not in actual implementations, which follows the Dependency Inversion Principle.
 *
 * @param view - Implementation of the View function
 * @param dependencies - Implementation of the Backend endpoints
 * @returns void. It just triggers the function to integrate everything
 */
export function createNewShipmentController(view: NewShipmentView, dependencies: Dependencies) {
  const invalidFields = new Set<keyof NewShipment>();

  // Submitting state
  let isSubmitting = false;

  // #region Helpers - too small to create a new file for it
  function validateOne(name: keyof NewShipment): void {
    const raw = view.readValues();
    const fieldErrors = validateShipmentField(name, `${raw[name]}`, raw.country);
    view.renderErrors({ [name]: fieldErrors });
    if (fieldErrors.length > 0) invalidFields.add(name);
    else invalidFields.delete(name);
  }
  // #endregion

  // #region Controller functions
  // Fetch Shipping methods and populate the view when recieved
  async function loadMethods(): Promise<void> {
    view.setShippingLoading();
    try {
      const methods = await dependencies.loadShippingMethods();
      view.showShippingMethods(methods);
    } catch {
      view.setShippingError();
    }
  }

  // Triggers form submission and handles errors
  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (isSubmitting) return;

    // Validate and display Errors
    const result = validateAll(view.readValues());
    view.clearErrors();
    if (!result.ok) view.renderErrors(result.errors);
    invalidFields.clear();

    if (!result.ok) {
      for (const name of Object.keys(result.errors) as any) invalidFields.add(name);
      view.focusFirstError(result.errors);
      return;
    }

    // Start submit API call
    isSubmitting = true;
    view.setSubmitting(true);
    try {
      await dependencies.submitShipment(result.data);

      // If Succeed ...
      view.resetForm();
      view.clearErrors();
      view.syncCustoms();
      invalidFields.clear();
      view.showSuccess('Shipment created successfully.');
    } catch (error) {
      if (
        error instanceof TypeError ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) {
        // Network failure (fetch rejects with TypeError) or timeout
        view.showError(
          'The request could not reach the server or timed out. Check your connection and try again.',
        );
      } else if (error instanceof Error) {
        // API responded with a non-2xx status (message contains the status)
        view.showError(`The shipment could not be created (${error.message}). Please, try again.`);
      } else {
        view.showError('The shipment could not be created. Please, try again.');
      }
    } finally {
      isSubmitting = false;
      view.setSubmitting(false);
    }
  }
  // #endregion

  // #region Bind Handlers
  view.bindHandlers({
    onBlur: validateOne,
    onInput(name) {
      if (invalidFields.has(name)) validateOne(name);
    },
    onChange(name) {
      if (name === 'country') {
        view.syncCustoms();
        view.clearCustomsErrors();
      }
      validateOne(name);
    },
    onSubmit: (event) => void submit(event),
    onRetryShippingMethods: () => void loadMethods(),
  });
  // #endregion

  view.syncCustoms();
  void loadMethods();

  return { loadMethods };
}
