const express = require('express');
const { createRequest, getRequestById, updateRequestStatus } = require('../controllers/requestController');
const router = express.Router();

router.route("/createRequest").post(createRequest);
router.route("/:request_id").get(getRequestById);
router.route("/updateStatus/:request_id").put(updateRequestStatus);


module.exports = {router};