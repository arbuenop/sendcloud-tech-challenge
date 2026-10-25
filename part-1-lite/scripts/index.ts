import { getShippingMethods, postShipment } from './api';
import { createNewShipmentController } from './controller';
import { createNewShipmentView } from './view';

createNewShipmentController(createNewShipmentView(), {
  submitShipment: postShipment,
  loadShippingMethods: getShippingMethods,
});
