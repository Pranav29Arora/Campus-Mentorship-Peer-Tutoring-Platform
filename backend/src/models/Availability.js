// Documented Model representing an Availability Slot in Supabase PostgreSQL
// Table: 'availability'

class Availability {
  constructor({ id, mentorId, date, startTime, endTime, status = 'available', subject = 'General Mentorship', createdAt }) {
    this.id = id;               // String (Primary key)
    this.mentorId = mentorId;   // String (FK references mentors.id, db: mentor_id)
    this.date = date;           // String (YYYY-MM-DD)
    this.startTime = startTime; // String (HH:MM, db: start_time)
    this.endTime = endTime;     // String (HH:MM, db: end_time)
    this.status = status;       // String ('available' | 'booked')
    this.subject = subject;     // String
    this.createdAt = createdAt || new Date().toISOString();
  }
}

module.exports = Availability;
