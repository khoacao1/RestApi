const express = require('express');
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const UserController = require("../controllers/user");

router.post('/signup', UserController.user_signup)

router.delete('/:userID', checkAuth, UserController.user_delete)

router.post('/login', UserController.user_login)

// This Route is for testing and debugging only
// router.get('/', UserController.user_get_all)

module.exports = router;
