const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:mentorId', reviewController.getMentorReviews);
router.post('/', authMiddleware, reviewController.createReview);

module.exports = router;
