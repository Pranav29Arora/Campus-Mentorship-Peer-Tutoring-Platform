// Documented Schema model representing a Mentor's profile
// Extends the core User account with academic expertise details.

class Mentor {
  constructor({ id, userId, bio, subjects, expertise, rating = 5.0, totalSessions = 0 }) {
    this.id = id;                     // String (Mentor unique ID)
    this.userId = userId;             // String (Foreign key references User.id)
    this.bio = bio;                   // String (Introductory bio description)
    this.subjects = subjects || [];   // Array of strings (e.g. ['React', 'JavaScript'])
    this.expertise = expertise || []; // Array of strings (e.g. ['Frontend Development'])
    this.rating = rating;             // Number (Average 5-star rating)
    this.totalSessions = totalSessions; // Number (Count of completed peer tutorials)
  }
}

/*
Example Mongoose Model configuration:

const mongoose = require('mongoose');
const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: { type: String, required: true },
  subjects: [{ type: String }],
  expertise: [{ type: String }],
  rating: { type: Number, default: 5.0 },
  totalSessions: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Mentor', mentorSchema);
*/

module.exports = Mentor;
