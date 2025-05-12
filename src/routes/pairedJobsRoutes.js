const express = require('express');
const { createPairedJob } = require('../controllers/pairedJobsController');
const router = express.Router();

router.route("/pairedJobs/createPairedJob").post(createPairedJob);

module.exports = {router};