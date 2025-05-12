const express = require('express');
const router = express.Router();
const { createOffers } = require('../controllers/offerController');

router.route("offer/createOffers").post(createOffers);

module.exports = {router};