import { validateAll } from './validations';
import type { NewShipmentView } from './view';
import type { NewShipment } from './schema';
import { ShippingMethod } from './shipping-methods';

type Dependencies = {
  submitShipment: (shipment: NewShipment) => Promise<void>;
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
  // Submitting state
  let isSubmitting = false;

  // #region Controller functions
  async function loadMethods(): Promise<void> {
    view.setShippingLoading();
    try {
      view.showShippingMethods(await dependencies.loadShippingMethods());
    } catch {
      view.setShippingError();
    }
  }

  // Triggers form submission and handles errors
  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (isSubmitting) return;

    const result = validateAll(view.readValues());
    view.clearErrors();
    if (!result.ok) {
      view.showValidationErrors(result.errors);
      return;
    }

    // Start submit API call
    isSubmitting = true;
    view.setSubmitting(true);
    try {
      await dependencies.submitShipment(result.data);

      // If Succeed ...
      view.resetForm();
      view.syncCustoms();
      view.showSuccess('Shipment created successfully.');
    } catch (error) {
      if (
        error instanceof TypeError ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) {
        view.showError(
          'The request could not reach the server or timed out. Check your connection and try again.',
        );
      } else if (error instanceof Error) {
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
    onSubmit: (event) => void submit(event),
    onRetryShippingMethods: () => void loadMethods(),
  });
  // #endregion

  view.syncCustoms();
  void loadMethods();

  return { loadMethods };
}
