const express = require('express');
const router = express.Router();
const { createOffers, getOfferById } = require('../controllers/offerController');

router.route("/createOffers").post(createOffers);
router.route("/:offer_id").get(getOfferById);

module.exports = {router};