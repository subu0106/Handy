const express = require('express');
const { registerProvider } = require('../controllers/providerController');
const { getServiceProviders } = require('../controllers/servicesController');
const router = express.Router();

router.route("/registerProvider").post(registerProvider);
router.route("/:service_id").get(getServiceProviders);

module.exports = {router};