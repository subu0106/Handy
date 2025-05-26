const express = require('express');
const { createRequest, 
        getRequestById, 
        updateRequestStatus, 
        getAllActiveRequestsForProvider,
        deleteRequest,
        getAllActiveRequestsForConsumer } = require('../controllers/requestController');
const router = express.Router();

router.route("/getRequest/:request_id").get(getRequestById);
router.route("/getActiveRequestsForProvider/:provider_id").get(getAllActiveRequestsForProvider);
router.route("/getActiveRequestsForConsumer/:consumer_id").get(getAllActiveRequestsForConsumer);
router.route("/createRequest").post(createRequest);
router.route("/updateStatus/:request_id").put(updateRequestStatus);
router.route("/deleteRequest/:request_id").delete(deleteRequest);


module.exports = {router};
