const express = require('express');
const { createRequest } = require('../controllers/requestController');
const router = express.Router();

router.route("/createRequest").post(createRequest);

module.exports = {router};