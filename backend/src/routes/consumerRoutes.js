const express = require('express');
const router = express.Router();
const { registerConsumer, updateConsumer ,softDeleteConsumer,hardDeleteConsumer} = require('../controllers/consumerController');

router.route("/registerConsumer").post(registerConsumer);
router.route("/updateConsumer/:consumer_id").put(updateConsumer);
router.route("/consumer/softDeleteConsumer/:consumer_id").delete(softDeleteConsumer);
router.route("/consumer/hardDeleteConsumer/:consumer_id").delete(hardDeleteConsumer);


module.exports = {router};