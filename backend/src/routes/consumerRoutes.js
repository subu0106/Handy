const express = require('express');
const router = express.Router();

const { registerConsumer, updateConsumer ,softDeleteConsumer,hardDeleteConsumer} = require('../controllers/consumerController');
const {authenticateToken} = require('../middlewares/authenticate');


router.route("/registerConsumer").post(authenticateToken, registerConsumer);
router.route("/updateConsumer/:consumer_id").put(authenticateToken, updateConsumer);
router.route("/consumer/softDeleteConsumer/:consumer_id").delete(authenticateToken, softDeleteConsumer);
router.route("/consumer/hardDeleteConsumer/:consumer_id").delete(authenticateToken, hardDeleteConsumer);


module.exports = {router};