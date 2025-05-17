const express = require('express');
const router = express.Router();
const { registerConsumer, updateConsumer } = require('../controllers/consumerController');

router.route("/registerConsumer").post(registerConsumer);
router.route("/updateConsumer/:consumer_id").put(updateConsumer);

module.exports = {router};