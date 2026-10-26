const supabase = require('../config/supabase');
const jwtUtil = require('../utils/jwt');
const pwdUtil = require('../utils/password');

const mapUserToResponse = (user, mentorId = null) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  rollNumber: user.roll_number || user.rollNumber,
  role: user.role,
  department: user.department,
  year: user.year,
  avatar: user.avatar,
  mentorId
});

const login = async ({ email, password }) => {
  // Query user from Supabase PostgreSQL
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email.trim());

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  const user = users && users[0];
  if (!user) {
    throw new Error('Invalid email address or password.');
  }

  if (user.status === 'disabled') {
    throw new Error('Your account has been suspended by the administrator.');
  }

  // Verify password using bcrypt or demo fallback
  let isMatch = false;
  if (
    (email.toLowerCase() === 'student@campusconnect.com' && password === 'student123') ||
    (email.toLowerCase() === 'mentor@campusconnect.com' && password === 'mentor123') ||
    (email.toLowerCase() === 'admin@campusconnect.com' && password === 'admin123')
  ) {
    isMatch = true;
  } else {
    isMatch = await pwdUtil.comparePassword(password, user.password_hash);
  }

  if (!isMatch) {
    throw new Error('Invalid email address or password.');
  }

  // Update last sign in time in Supabase auth.users
  supabase.rpc('record_user_login', { user_email: user.email }).catch(err => {
    console.warn('Failed to record login timestamp:', err.message);
  });

  // Get linked mentor record if applicable
  let mentorId = null;
  if (user.role === 'mentor') {
    const { data: mentorData } = await supabase
      .from('mentors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (mentorData) {
      mentorId = mentorData.id;
    }
  }

  const token = jwtUtil.generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: mapUserToResponse(user, mentorId)
  };
};

const register = async (userData) => {
  if (!userData.rollNumber || !userData.rollNumber.trim()) {
    throw new Error('University Roll Number is mandatory to register.');
  }

  const cleanEmail = userData.email.trim().toLowerCase();
  const cleanRoll = userData.rollNumber.trim().toUpperCase();

  // Check existing email
  const { data: existingEmail } = await supabase
    .from('users')
    .select('id')
    .ilike('email', cleanEmail)
    .maybeSingle();

  if (existingEmail) {
    throw new Error('An account with this email address already exists.');
  }

  // Check existing roll number
  const { data: existingRoll } = await supabase
    .from('users')
    .select('id')
    .ilike('roll_number', cleanRoll)
    .maybeSingle();

  if (existingRoll) {
    throw new Error('An account with this University Roll Number already exists.');
  }

  const passwordHash = await pwdUtil.hashPassword(userData.password);
  const newUserId = `user_${Date.now()}`;

  const newUserRow = {
    id: newUserId,
    name: userData.name,
    email: cleanEmail,
    roll_number: cleanRoll,
    password_hash: passwordHash,
    role: userData.role,
    department: userData.department || 'General',
    year: parseInt(userData.year) || 1,
    avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
    status: 'active'
  };

  const { error: insertError } = await supabase
    .from('users')
    .insert([newUserRow]);

  if (insertError) {
    throw new Error(`Failed to create account: ${insertError.message}`);
  }

  let mentorId = null;
  // If registered as mentor, insert mentor profile
  if (userData.role === 'mentor') {
    mentorId = `mentor_${Date.now()}`;
    const newMentorRow = {
      id: mentorId,
      user_id: newUserId,
      bio: userData.bio || 'Experienced student ready to help peers.',
      subjects: userData.subjects || [],
      expertise: userData.expertise || [],
      rating: 5.00,
      total_sessions: 0
    };

    const { error: mentorInsertErr } = await supabase
      .from('mentors')
      .insert([newMentorRow]);

    if (mentorInsertErr) {
      console.error('Error creating mentor profile:', mentorInsertErr);
    }
  }

  const token = jwtUtil.generateToken({ id: newUserId, email: cleanEmail, role: userData.role });

  return {
    token,
    user: mapUserToResponse(newUserRow, mentorId)
  };
};

module.exports = {
  login,
  register
};
