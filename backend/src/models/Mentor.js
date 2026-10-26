// Documented Model representing a Mentor Profile in Supabase PostgreSQL
// Table: 'mentors'

class Mentor {
  constructor({ id, userId, bio, subjects = [], expertise = [], rating = 5.0, totalSessions = 0, createdAt, updatedAt }) {
    this.id = id;                     // String (Mentor ID)
    this.userId = userId;             // String (Foreign key references users.id, db: user_id)
    this.bio = bio;                   // String (Introductory bio)
    this.subjects = subjects;         // Array of strings (db: text[])
    this.expertise = expertise;       // Array of strings (db: text[])
    this.rating = rating;             // Number (db: numeric(3,2))
    this.totalSessions = totalSessions; // Number (Count of completed sessions, db: total_sessions)
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }
}

module.exports = Mentor;
