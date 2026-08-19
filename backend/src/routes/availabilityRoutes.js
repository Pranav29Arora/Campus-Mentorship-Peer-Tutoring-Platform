const express = require('express');
const availabilityController = require('../controllers/availabilityController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/:mentorId', availabilityController.getSlots);
router.post('/', authMiddleware, roleMiddleware(['mentor']), availabilityController.createSlot);
router.delete('/:id', authMiddleware, roleMiddleware(['mentor']), availabilityController.deleteSlot);

module.exports = router;
