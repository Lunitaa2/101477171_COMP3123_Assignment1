const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { signupValidation, loginValidation } = require('../middleware/validators');

router.post('/signup', signupValidation, userController.signup);
router.post('/login', loginValidation, userController.login);

module.exports = router;
