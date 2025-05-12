const express = require('express');
const { createPairedJob } = require('../controllers/pairedJobsController');
const router = express.Router();

router.route("/createPairedJob").post(createPairedJob);

module.exports = {router};