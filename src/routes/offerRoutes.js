const express = require('express');
const router = express.Router();
const { createOffers } = require('../controllers/offerController');

router.route("/createOffers").post(createOffers);

module.exports = {router};