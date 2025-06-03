const express = require('express');
const router = express.Router();

const {authenticateToken} = require('../middlewares/authenticate');

const { createRequest, 
        getRequestById, 
        updateRequestStatus,
        getAllActiveRequests, 
        getAllActiveRequestsForProvider,
        deleteRequest,
        getAllActiveRequestsForConsumer } = require('../controllers/requestController');

router.route("/getRequest/:request_id").get(authenticateToken, getRequestById);
router.route("/getActiveRequests").get(authenticateToken, getAllActiveRequests);
router.route("/getActiveRequestsForProvider/:provider_id").get(authenticateToken, getAllActiveRequestsForProvider);
router.route("/getActiveRequestsForConsumer/:consumer_id").get(getAllActiveRequestsForConsumer);
router.route("/createRequest").post(authenticateToken, createRequest);
router.route("/updateStatus/:request_id").put(authenticateToken, updateRequestStatus);
router.route("/deleteRequest/:request_id").delete(authenticateToken, deleteRequest);


module.exports = {router};
