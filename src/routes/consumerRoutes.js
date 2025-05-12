const express = require('express');
const router = express.Router();
const { registerConsumer } = require('../controllers/consumerController');

router.route("/register/consumer").post(registerConsumer);

module.exports = {router};