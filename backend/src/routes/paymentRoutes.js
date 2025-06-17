const express = require('express');
const router = express.Router();

const { createPaymentIntent, confirmPayment } = require('../controllers/paymentController');
const { authenticateToken } = require('../middlewares/authenticate');

router.route('/createPaymentIntent').post(authenticateToken, createPaymentIntent);
router.route('/confirmPayment/:paymentIntentId').post(authenticateToken, confirmPayment);

module.exports = { router };