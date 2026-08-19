// Documented Schema model representing a Booking session

class Booking {
  constructor({ id, studentId, mentorId, date, startTime, endTime, status = 'upcoming', meetingStatus = 'disconnected', createdAt }) {
    this.id = id;                     // String
    this.studentId = studentId;       // String (References User.id)
    this.mentorId = mentorId;         // String (References Mentor.id)
    this.date = date;                 // String (YYYY-MM-DD)
    this.startTime = startTime;       // String (HH:MM e.g. "10:00")
    this.endTime = endTime;           // String (HH:MM e.g. "11:00")
    this.status = status;             // String ('upcoming' | 'completed' | 'cancelled')
    this.meetingStatus = meetingStatus; // String ('disconnected' | 'connecting' | 'connected')
    this.createdAt = createdAt || new Date().toISOString();
  }
}

/*
Example Mongoose Model configuration:

const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  meetingStatus: { type: String, enum: ['disconnected', 'connecting', 'connected'], default: 'disconnected' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
*/

module.exports = Booking;
