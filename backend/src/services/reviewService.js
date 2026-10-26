const supabase = require('../config/supabase');

const formatReview = (r) => ({
  id: r.id,
  bookingId: r.booking_id,
  studentId: r.student_id,
  studentName: r.student?.name || 'Junior Student',
  mentorId: r.mentor_id,
  rating: r.rating,
  comment: r.comment || '',
  createdAt: r.created_at
});

const getReviewsForMentor = async (mentorId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      booking_id,
      student_id,
      mentor_id,
      rating,
      comment,
      created_at,
      student:student_id (
        name
      )
    `)
    .eq('mentor_id', mentorId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  return (data || []).map(formatReview);
};

const createReview = async (studentId, reviewData) => {
  const { bookingId, rating, comment } = reviewData;

  // 1. Validate booking
  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle();

  if (bookingErr || !booking) {
    throw new Error('Booking session not found.');
  }

  if (booking.student_id !== studentId) {
    throw new Error('Unauthorized. You can only review your own tutoring sessions.');
  }

  if (booking.status !== 'completed') {
    throw new Error('Cannot review this booking. The session is not marked as completed yet.');
  }

  // 2. Prevent duplicate review for the same booking
  const { data: duplicate } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (duplicate) {
    throw new Error('You have already submitted a review for this tutoring session.');
  }

  // 3. Resolve student name
  const { data: student } = await supabase
    .from('users')
    .select('name')
    .eq('id', studentId)
    .maybeSingle();

  const studentName = student?.name || 'Junior Student';

  // 4. Insert review into Supabase
  const reviewId = `review_${Date.now()}`;
  const newReviewRow = {
    id: reviewId,
    booking_id: bookingId,
    student_id: studentId,
    mentor_id: booking.mentor_id,
    rating: parseInt(rating),
    comment: comment || '',
    created_at: new Date().toISOString()
  };

  const { error: insertErr } = await supabase
    .from('reviews')
    .insert([newReviewRow]);

  if (insertErr) {
    throw new Error(`Failed to save review: ${insertErr.message}`);
  }

  // 5. Mark booking as reviewed
  await supabase
    .from('bookings')
    .update({ is_reviewed: true })
    .eq('id', bookingId);

  // 6. Recalculate mentor's average rating
  const { data: mentorReviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('mentor_id', booking.mentor_id);

  if (mentorReviews && mentorReviews.length > 0) {
    const totalStars = mentorReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = parseFloat((totalStars / mentorReviews.length).toFixed(1));

    await supabase
      .from('mentors')
      .update({ rating: avg })
      .eq('id', booking.mentor_id);
  }

  return {
    id: reviewId,
    bookingId,
    studentId,
    studentName,
    mentorId: booking.mentor_id,
    rating: parseInt(rating),
    comment: comment || '',
    createdAt: newReviewRow.created_at
  };
};

module.exports = {
  getReviewsForMentor,
  createReview
};
