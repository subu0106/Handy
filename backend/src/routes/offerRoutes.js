const express = require('express');
const router = express.Router();

const { 
  createOffers, 
  getOfferById, 
  updateOfferStatus,
  updateOfferBudget, // Add this import
  deleteOffer, 
  getOffersByRequestId,
  getOffersByProviderId,
  getOfferByProviderAndRequest
} = require('../controllers/offerController');
const {authenticateToken} = require('../middlewares/authenticate');


router.route("/createOffers").post(authenticateToken, createOffers);
router.route("/").get(authenticateToken, getOffersByRequestId); // For ?requestId=123
router.route("/provider/:provider_id").get(authenticateToken, getOffersByProviderId); // More specific route first
router.route("/provider/:provider_id/request/:request_id").get(authenticateToken, getOfferByProviderAndRequest);
router.route("/:offer_id").get(authenticateToken, getOfferById); // Generic route last
router.route("/updateStatus/:offer_id").put(authenticateToken, updateOfferStatus);
router.route("/updateBudget/:offer_id").put(authenticateToken, updateOfferBudget); // Add this new route
router.route("/deleteOffer/:offer_id").delete(authenticateToken, deleteOffer);

module.exports = {router};