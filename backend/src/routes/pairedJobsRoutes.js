const express = require('express');
const router = express.Router();

const { createPairedJob, getPairedJobs } = require('../controllers/pairedJobsController');
const {authenticateToken} = require('../middlewares/authenticate');

router.route("/").get(authenticateToken, getPairedJobs);
router.route("/createPairedJob").post(authenticateToken, createPairedJob);

module.exports = {router};