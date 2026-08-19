// Documented Schema model representing a User
// This maps directly to Firebase Auth / Firestore or MongoDB User Collection.

class User {
  constructor({ id, name, email, passwordHash, role, department, year, avatar, status = 'active', createdAt }) {
    this.id = id;                     // String (Firebase UID or MongoDB ObjectId)
    this.name = name;                 // String
    this.email = email;               // String
    this.passwordHash = passwordHash; // String (bcrypt hashed password)
    this.role = role;                 // String ('student' | 'mentor' | 'admin')
    this.department = department;     // String (e.g. 'Computer Science')
    this.year = year;                 // Number (1 | 2 | 3 | 4)
    this.avatar = avatar;             // String (Avatar URL or path)
    this.status = status;             // String ('active' | 'disabled')
    this.createdAt = createdAt || new Date().toISOString();
  }
}

/*
Example Mongoose Model configuration for future MongoDB setup:

const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
  department: { type: String },
  year: { type: Number },
  avatar: { type: String },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
*/

module.exports = User;
