const supabase = require('../config/supabase');

const formatMentor = (m) => {
  const u = m.users || {};
  return {
    id: m.id,
    userId: m.user_id,
    name: u.name || 'Mentor',
    email: u.email || '',
    rollNumber: u.roll_number || '',
    department: u.department || '',
    year: u.year || 1,
    avatar: u.avatar || '',
    bio: m.bio || '',
    subjects: m.subjects || [],
    expertise: m.expertise || [],
    rating: parseFloat(m.rating || 5.0),
    totalSessions: m.total_sessions || 0,
    createdAt: m.created_at
  };
};

let mentorsCache = null;
let mentorsCacheTime = 0;
const MENTORS_CACHE_TTL = 15000; // 15 seconds

const getMentors = async (filters = {}) => {
  const now = Date.now();
  let mentorsData;

  // Use cached data if available and fresh, avoiding repetitive Supabase network round-trips
  if (mentorsCache && now - mentorsCacheTime < MENTORS_CACHE_TTL) {
    mentorsData = mentorsCache;
  } else {
    // Query mentors joined with users
    const query = supabase
      .from('mentors')
      .select(`
        id,
        user_id,
        bio,
        subjects,
        expertise,
        rating,
        total_sessions,
        created_at,
        users:user_id (
          id,
          name,
          email,
          roll_number,
          department,
          year,
          avatar,
          status
        )
      `);

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch mentors: ${error.message}`);
    }
    mentorsData = data || [];
    mentorsCache = mentorsData;
    mentorsCacheTime = now;
  }

  let list = mentorsData
    .filter(m => m.users && m.users.status !== 'disabled')
    .map(formatMentor);

  // Search filter (matches name, bio, or subjects)
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.bio.toLowerCase().includes(q) ||
      m.subjects.some(sub => sub.toLowerCase().includes(q))
    );
  }

  // Department filter
  if (filters.department) {
    list = list.filter(m => m.department === filters.department);
  }

  // Subject filter
  if (filters.subject) {
    const subQuery = filters.subject.toLowerCase();
    list = list.filter(m => m.subjects.some(sub => sub.toLowerCase() === subQuery));
  }

  // Minimum rating filter
  if (filters.minRating) {
    const min = parseFloat(filters.minRating);
    list = list.filter(m => m.rating >= min);
  }

  // Sorting
  if (filters.sortBy) {
    if (filters.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'sessions') {
      list.sort((a, b) => b.totalSessions - a.totalSessions);
    }
  }

  return list;
};

const getMentorById = async (id) => {
  const { data: mentorData, error } = await supabase
    .from('mentors')
    .select(`
      id,
      user_id,
      bio,
      subjects,
      expertise,
      rating,
      total_sessions,
      created_at,
      users:user_id (
        id,
        name,
        email,
        roll_number,
        department,
        year,
        avatar,
        status
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error || !mentorData) {
    throw new Error('Mentor profile not found.');
  }

  const mentor = formatMentor(mentorData);

  // Fetch reviews linked to this mentor
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*')
    .eq('mentor_id', id)
    .order('created_at', { ascending: false });

  // Fetch availability slots for this mentor
  const { data: slotsData } = await supabase
    .from('availability')
    .select('*')
    .eq('mentor_id', id)
    .order('date', { ascending: true });

  const formattedReviews = (reviewsData || []).map(r => ({
    id: r.id,
    bookingId: r.booking_id,
    studentId: r.student_id,
    mentorId: r.mentor_id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at
  }));

  const formattedSlots = (slotsData || []).map(s => ({
    id: s.id,
    mentorId: s.mentor_id,
    date: s.date,
    startTime: s.start_time,
    endTime: s.end_time,
    status: s.status,
    subject: s.subject,
    createdAt: s.created_at
  }));

  return {
    ...mentor,
    reviews: formattedReviews,
    availability: formattedSlots
  };
};

const updateMentorProfile = async (mentorId, updateData) => {
  const payload = {};
  if (updateData.bio !== undefined) payload.bio = updateData.bio;
  if (updateData.subjects !== undefined) payload.subjects = updateData.subjects;
  if (updateData.expertise !== undefined) payload.expertise = updateData.expertise;
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('mentors')
    .update(payload)
    .eq('id', mentorId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update mentor profile: ${error.message}`);
  }

  mentorsCache = null; // Invalidate cache immediately

  return getMentorById(mentorId);
};

module.exports = {
  getMentors,
  getMentorById,
  updateMentorProfile
};
