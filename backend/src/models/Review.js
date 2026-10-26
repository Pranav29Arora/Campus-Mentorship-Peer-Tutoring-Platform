// Documented Model representing a Review in Supabase PostgreSQL
// Table: 'reviews'

class Review {
  constructor({ id, bookingId, studentId, mentorId, rating, comment = '', createdAt }) {
    this.id = id;               // String (Primary key)
    this.bookingId = bookingId; // String (FK references bookings.id, db: booking_id)
    this.studentId = studentId; // String (FK references users.id, db: student_id)
    this.mentorId = mentorId;   // String (FK references mentors.id, db: mentor_id)
    this.rating = rating;       // Number (1 to 5)
    this.comment = comment;     // String
    this.createdAt = createdAt || new Date().toISOString();
  }
}

module.exports = Review;
