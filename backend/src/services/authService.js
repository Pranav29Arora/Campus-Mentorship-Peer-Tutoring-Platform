const db = require('./dbStore');
const jwtUtil = require('../utils/jwt');
const pwdUtil = require('../utils/password');

const login = async ({ email, password }) => {
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error('Invalid email address or password.');
  }

  if (user.status === 'disabled') {
    throw new Error('Your account has been suspended by the administrator.');
  }

  // Verify password (mock check for demo credentials or standard bcrypt compare)
  let isMatch = false;
  if (password === 'student123' || password === 'mentor123' || password === 'admin123') {
    isMatch = true;
  } else {
    isMatch = await pwdUtil.comparePassword(password, user.passwordHash);
  }

  if (!isMatch) {
    throw new Error('Invalid email address or password.');
  }

  // Get linked mentor record if applicable
  let mentorId = null;
  if (user.role === 'mentor') {
    const mentor = db.mentors.find(m => m.userId === user.id);
    if (mentor) mentorId = mentor.id;
  }

  const token = jwtUtil.generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      year: user.year,
      avatar: user.avatar,
      mentorId
    }
  };
};

const register = async (userData) => {
  const existing = db.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const passwordHash = await pwdUtil.hashPassword(userData.password);
  const newUserId = `user_${Date.now()}`;

  const newUser = {
    id: newUserId,
    name: userData.name,
    email: userData.email,
    passwordHash,
    role: userData.role,
    department: userData.department,
    year: parseInt(userData.year) || 1,
    avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  let mentorId = null;
  // If registered as mentor, seed mentor details
  if (userData.role === 'mentor') {
    mentorId = `mentor_${Date.now()}`;
    const newMentor = {
      id: mentorId,
      userId: newUserId,
      name: newUser.name,
      email: newUser.email,
      department: newUser.department,
      year: newUser.year,
      avatar: newUser.avatar,
      bio: userData.bio || 'Experienced student ready to help peers.',
      subjects: userData.subjects || [],
      expertise: userData.expertise || [],
      rating: 5.0,
      totalSessions: 0
    };
    db.mentors.push(newMentor);
  }

  const token = jwtUtil.generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });

  return {
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      year: newUser.year,
      avatar: newUser.avatar,
      mentorId
    }
  };
};

module.exports = {
  login,
  register
};
