const express = require('express');
const { createPairedJob, getPairedJobs } = require('../controllers/pairedJobsController');
const router = express.Router();

router.route("/").get(getPairedJobs);
router.route("/createPairedJob").post(createPairedJob);

module.exports = {router};