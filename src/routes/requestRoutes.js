const express = require('express');
const { createRequest, getRequestById } = require('../controllers/requestController');
const router = express.Router();

router.route("/createRequest").post(createRequest);
router.route("/:request_id").get(getRequestById);

module.exports = {router};