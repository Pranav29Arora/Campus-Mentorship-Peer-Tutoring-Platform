// Documented Model representing a Booking in Supabase PostgreSQL
// Table: 'bookings'

class Booking {
  constructor({ id, studentId, mentorId, subject, date, startTime, endTime, status = 'upcoming', meetingStatus = 'disconnected', isReviewed = false, createdAt, updatedAt }) {
    this.id = id;                     // String (Primary key)
    this.studentId = studentId;       // String (FK references users.id, db: student_id)
    this.mentorId = mentorId;         // String (FK references mentors.id, db: mentor_id)
    this.subject = subject;           // String
    this.date = date;                 // String (YYYY-MM-DD)
    this.startTime = startTime;       // String (HH:MM e.g. "10:00", db: start_time)
    this.endTime = endTime;           // String (HH:MM e.g. "11:00", db: end_time)
    this.status = status;             // String ('upcoming' | 'completed' | 'cancelled')
    this.meetingStatus = meetingStatus; // String ('disconnected' | 'connecting' | 'connected', db: meeting_status)
    this.isReviewed = isReviewed;     // Boolean (db: is_reviewed)
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }
}

module.exports = Booking;
