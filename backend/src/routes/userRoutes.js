const express = require('express');
const router = express.Router();

const {getUserById} = require('./../controllers/userController');
const {authenticateToken} = require('../middlewares/authenticate');


router.route("/user_info/:user_id").get(authenticateToken, getUserById);

module.exports = {router};
