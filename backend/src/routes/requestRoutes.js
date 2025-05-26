const express = require('express');
const { createRequest, getRequestById, updateRequestStatus, getAllActiveRequests,deleteRequest } = require('../controllers/requestController');
const router = express.Router();

router.route("/getRequest/:request_id").get(getRequestById);
router.route("/getActiveRequests/:provider_id").get(getAllActiveRequests);
router.route("/createRequest").post(createRequest);
router.route("/updateStatus/:request_id").put(updateRequestStatus);
router.route("/deleteRequest/:request_id").delete(deleteRequest);


module.exports = {router};
