const express = require('express');
const { registerProvider } = require('../controllers/providerController');
const router = express.Router();

router.route("provider/registerProvider").post(registerProvider);

module.exports = {router};