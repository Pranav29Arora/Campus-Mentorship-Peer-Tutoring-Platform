const db = require('./dbStore');

const getReviewsForMentor = async (mentorId) => {
  return db.reviews.filter(r => r.mentorId === mentorId);
};

const createReview = async (studentId, reviewData) => {
  const { bookingId, rating, comment } = reviewData;

  // Validate booking completion
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) {
    throw new Error('Booking session not found.');
  }

  if (booking.studentId !== studentId) {
    throw new Error('Unauthorized. You can only review your own tutoring sessions.');
  }

  if (booking.status !== 'completed') {
    throw new Error('Cannot review this booking. The session is not marked as completed yet.');
  }

  // Prevent multiple reviews for the same booking
  const duplicate = db.reviews.find(r => r.bookingId === bookingId);
  if (duplicate) {
    throw new Error('You have already submitted a review for this tutoring session.');
  }

  // Resolve student name
  const student = db.users.find(u => u.id === studentId);
  const studentName = student ? student.name : 'Junior Student';

  const newReview = {
    id: `review_${Date.now()}`,
    bookingId,
    studentId,
    studentName,
    mentorId: booking.mentorId,
    rating: parseInt(rating),
    comment,
    createdAt: new Date().toISOString()
  };

  db.reviews.push(newReview);

  // Recalculate mentor's average rating
  const mentorReviews = db.reviews.filter(r => r.mentorId === booking.mentorId);
  if (mentorReviews.length > 0) {
    const totalRating = mentorReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / mentorReviews.length;

    // Update mentor rating to 1 decimal place
    const mentor = db.mentors.find(m => m.id === booking.mentorId);
    if (mentor) {
      mentor.rating = parseFloat(avgRating.toFixed(1));
    }
  }

  return newReview;
};

module.exports = {
  getReviewsForMentor,
  createReview
};
