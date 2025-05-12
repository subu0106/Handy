const express = require('express');
const router = express.Router();
const { createOffers, getOffer } = require('../controllers/offerController');

router.route("/createOffers").post(createOffers);
router.route("/:offer_id").get(getOffer);

module.exports = {router};