const express = require('express');
const router = express.Router();

const {sampleGet, samplePost} = require("../controllers/sampleController");

router.route("/sample").get(sampleGet);
router.route("/sample").post(samplePost);

module.exports = {router};