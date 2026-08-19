const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/statistics', adminController.getStatistics);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

module.exports = router;
