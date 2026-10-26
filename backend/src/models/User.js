// Documented Model representing a User in Supabase PostgreSQL
// Table: 'users'

class User {
  constructor({ id, name, email, rollNumber, passwordHash, role, department, year, avatar, status = 'active', createdAt, updatedAt }) {
    this.id = id;                     // String (Primary Key text)
    this.name = name;                 // String
    this.email = email;               // String (Unique)
    this.rollNumber = rollNumber;     // String (Unique University Roll Number, db: roll_number)
    this.passwordHash = passwordHash; // String (bcrypt hashed password, db: password_hash)
    this.role = role;                 // String ('student' | 'mentor' | 'admin')
    this.department = department;     // String (e.g. 'Computer Science')
    this.year = year;                 // Number (1 | 2 | 3 | 4)
    this.avatar = avatar;             // String (Avatar URL)
    this.status = status;             // String ('active' | 'disabled')
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }
}

module.exports = User;
