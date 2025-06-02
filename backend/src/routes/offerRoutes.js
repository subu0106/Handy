const express = require('express');
const router = express.Router();

const { createOffers, getOfferById, updateOfferStatus,deleteOffer } = require('../controllers/offerController');
const {authenticateToken} = require('../middlewares/authenticate');


router.route("/createOffers").post(authenticateToken, createOffers);
router.route("/:offer_id").get(authenticateToken, getOfferById);
router.route("/updateStatus/:offer_id").put(authenticateToken, updateOfferStatus);
router.route("/deleteOffer/:offer_id").delete(authenticateToken, deleteOffer);

module.exports = {router};