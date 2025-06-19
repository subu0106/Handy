const express = require('express');
const router = express.Router();

const { createPairedJob, getPairedJobs, addRatingAndReview } = require('../controllers/pairedJobsController');
const {authenticateToken} = require('../middlewares/authenticate');

router.route("/").get(authenticateToken, getPairedJobs);
router.route("/createPairedJob").post(authenticateToken, createPairedJob);
router.route("/create").post(authenticateToken, createPairedJob);
router.route("/:job_id/rate").put(authenticateToken, addRatingAndReview);

module.exports = {router};