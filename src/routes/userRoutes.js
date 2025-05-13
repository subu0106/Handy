const express = require('express');

const router = express.Router();
const getUserById = require('./../controllers/userController');

router.route("/user_info/:user_id").get(getUserById);

module.exports = {router};
