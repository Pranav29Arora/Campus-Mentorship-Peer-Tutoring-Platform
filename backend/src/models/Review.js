// Documented Schema model representing a peer tutorial session review

class Review {
  constructor({ id, bookingId, studentId, mentorId, rating, comment, createdAt }) {
    this.id = id;               // String
    this.bookingId = bookingId; // String (References Booking.id)
    this.studentId = studentId; // String (References User.id of the Student)
    this.mentorId = mentorId;   // String (References Mentor.id of the Mentor)
    this.rating = rating;       // Number (1 to 5)
    this.comment = comment;     // String (Written evaluation)
    this.createdAt = createdAt || new Date().toISOString();
  }
}

/*
Example Mongoose Model configuration:

const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
*/

module.exports = Review;
