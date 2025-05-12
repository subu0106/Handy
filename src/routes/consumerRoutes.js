const express = require('express');
const router = express.Router();
const { registerConsumer } = require('../controllers/consumerController');

router.route("/consumer/registerConsumer").post(registerConsumer);

module.exports = {router};