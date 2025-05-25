const express = require('express');
const { registerProvider, updateProvider, updateAvailabilityProvider, softDeleteProvider, hardDeleteProvider} = require('../controllers/providerController');
const { getServiceProviders } = require('../controllers/servicesController');
const router = express.Router();

router.route("/registerProvider").post(registerProvider);
router.route("/:service_id").get(getServiceProviders);
router.route("/updateProvider/:user_id").put(updateProvider);
router.route("/updateAvailability/:provider_id").put(updateAvailabilityProvider);
router.route("/softDeleteProvider/:provider_id").delete(softDeleteProvider);
router.route("/hardDeleteProvider/:provider_id").delete(hardDeleteProvider);

module.exports = {router};