const express = require('express');
const router = express.Router();

const { createPairedJob, getPairedJobs } = require('../controllers/pairedJobsController');
const {authenticateToken} = require('../middlewares/authenticate');

router.route("/").get(authenticateToken, getPairedJobs);
router.route("/createPairedJob").post(authenticateToken, createPairedJob);
router.route("/create").post(authenticateToken, createPairedJob); // Add this line for frontend compatibility

module.exports = {router};