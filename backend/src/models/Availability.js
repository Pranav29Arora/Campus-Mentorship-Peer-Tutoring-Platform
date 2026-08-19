// Documented Schema model representing a Mentor's availability slot

class Availability {
  constructor({ id, mentorId, date, startTime, endTime, status = 'available', subject }) {
    this.id = id;               // String
    this.mentorId = mentorId;   // String (References Mentor.id)
    this.date = date;           // String (YYYY-MM-DD)
    this.startTime = startTime; // String (HH:MM)
    this.endTime = endTime;     // String (HH:MM)
    this.status = status;       // String ('available' | 'booked')
    this.subject = subject;     // String (e.g. 'Data Structures')
  }
}

/*
Example Mongoose Model configuration:

const mongoose = require('mongoose');
const availabilitySchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['available', 'booked'], default: 'available' },
  subject: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);
*/

module.exports = Availability;
