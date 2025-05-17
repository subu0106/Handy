const express = require('express');
const router = express.Router();
const { createOffers, getOfferById, updateOfferStatus } = require('../controllers/offerController');

router.route("/createOffers").post(createOffers);
router.route("/:offer_id").get(getOfferById);
router.route("/updateStatus/:offer_id").put(updateOfferStatus);

module.exports = {router};