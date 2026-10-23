import { getShippingMethods, postShipment } from './api/endpoints';
import { createNewShipmentController } from './controller/controller';
import { createNewShipmentView } from './view/view';

/**
 * This function connects the view rendering utilities with the API endpoints and handles schema validation.
 * Note that the comments describe how the MVC pattern comes together
 */
export function initNewShipment(): void {
  // Html links to the View TS function
  const view = createNewShipmentView();

  createNewShipmentController(
    // View Links to controller
    view,

    // API Links to controller
    {
      submitShipment: postShipment,
      loadShippingMethods: getShippingMethods,
    },
  );
}
