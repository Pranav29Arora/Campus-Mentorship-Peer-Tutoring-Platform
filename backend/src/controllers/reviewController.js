const reviewService = require('../services/reviewService');

const getMentorReviews = async (req, res, next) => {
  try {
    const { mentorId } = req.params;
    const reviews = await reviewService.getReviewsForMentor(mentorId);
    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews.',
      error: error.message
    });
  }
};

const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId and star rating.'
      });
    }

    const starVal = parseInt(rating);
    if (isNaN(starVal) || starVal < 1 || starVal > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating value must be an integer between 1 and 5.'
      });
    }

    const review = await reviewService.createReview(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit review.'
    });
  }
};

module.exports = {
  getMentorReviews,
  createReview
};
