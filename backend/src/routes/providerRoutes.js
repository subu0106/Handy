const express = require('express');
const { registerProvider, updateProvider } = require('../controllers/providerController');
const { getServiceProviders } = require('../controllers/servicesController');
const router = express.Router();

router.route("/registerProvider").post(registerProvider);
router.route("/:service_id").get(getServiceProviders);
router.route("/updateProvider/:user_id").put(updateProvider);

module.exports = {router};