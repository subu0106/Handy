const express = require('express');
const router = express.Router();

const { registerProvider, updateProvider, updateAvailabilityProvider, updateProviderRatingAndCount, softDeleteProvider, hardDeleteProvider} = require('../controllers/providerController');
const { getServiceProviders } = require('../controllers/servicesController');
const {authenticateToken} = require('../middlewares/authenticate');

router.route("/registerProvider").post(authenticateToken, registerProvider);
router.route("/:service_id").get(authenticateToken, getServiceProviders);
router.route("/updateProvider/:user_id").put(authenticateToken, updateProvider);
router.route("/updateAvailability/:provider_id").put(authenticateToken, updateAvailabilityProvider);
router.route("/rateProvider/:provider_id").put(authenticateToken, updateProviderRatingAndCount);
router.route("/softDeleteProvider/:provider_id").delete(authenticateToken, softDeleteProvider);
router.route("/hardDeleteProvider/:provider_id").delete(authenticateToken, hardDeleteProvider);

module.exports = {router};