const express = require('express');

const router = express.Router();
const retrieveUser = require('./../controllers/userController');

router.route("/user_info/:user_id").get(retrieveUser);

module.exports = router;
