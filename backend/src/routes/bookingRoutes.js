const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/', bookingController.getBookings);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);

module.exports = router;
