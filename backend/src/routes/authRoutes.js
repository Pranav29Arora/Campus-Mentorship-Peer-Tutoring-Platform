const express = require('express');
const authController = require('../controllers/authController');
const validationMiddleware = require('../middleware/validationMiddleware');
const router = express.Router();

router.post('/login', validationMiddleware(['email', 'password']), authController.login);
router.post('/register', validationMiddleware(['name', 'email', 'password', 'role', 'rollNumber']), authController.register);

module.exports = router;
