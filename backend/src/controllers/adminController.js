const supabase = require('../config/supabase');

const getStatistics = async (req, res, next) => {
  try {
    // 1. Fetch users summary
    const { data: users, error: userErr } = await supabase
      .from('users')
      .select('id, role, status');

    if (userErr) throw userErr;

    const totalStudents = users.filter(u => u.role === 'student').length;
    const activeUsers = users.filter(u => u.status === 'active').length;

    // 2. Fetch mentors count
    const { count: totalMentors, error: mentorErr } = await supabase
      .from('mentors')
      .select('*', { count: 'exact', head: true });

    if (mentorErr) throw mentorErr;

    // 3. Fetch bookings for metrics and charts
    const { data: bookings, error: bookingErr } = await supabase
      .from('bookings')
      .select('id, status, date, subject');

    if (bookingErr) throw bookingErr;

    const totalBookings = bookings.length;
    const completedSessions = bookings.filter(b => b.status === 'completed').length;

    // 4. Fetch reviews for avg rating
    const { data: reviews, error: reviewErr } = await supabase
      .from('reviews')
      .select('rating');

    if (reviewErr) throw reviewErr;

    let avgRating = 5.0;
    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      avgRating = parseFloat((sum / reviews.length).toFixed(2));
    }

    // 5. Sessions over time (grouped by date)
    const bookingsByDate = {};
    bookings.forEach(b => {
      bookingsByDate[b.date] = (bookingsByDate[b.date] || 0) + 1;
    });

    const sessionsOverTime = Object.keys(bookingsByDate).map(date => ({
      date,
      count: bookingsByDate[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // 6. Popular subjects
    const subjectCounts = {};
    bookings.forEach(b => {
      const sub = b.subject || 'General Mentorship';
      subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
    });

    const popularSubjects = Object.keys(subjectCounts).map(subject => ({
      subject,
      count: subjectCounts[subject]
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalMentors: totalMentors || 0,
          totalBookings,
          completedSessions,
          activeUsers,
          avgRating
        },
        charts: {
          sessionsOverTime,
          popularSubjects
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to aggregate statistics.',
      error: error.message
    });
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, roll_number, role, department, year, avatar, status, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (users || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      rollNumber: u.roll_number,
      role: u.role,
      department: u.department,
      year: u.year,
      avatar: u.avatar,
      status: u.status,
      createdAt: u.created_at
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
      error: error.message
    });
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'disabled'

    if (!status || !['active', 'disabled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'active' or 'disabled'."
      });
    }

    // Check if user is admin
    const { data: user, error: findErr } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .maybeSingle();

    if (findErr || !user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Administrator accounts cannot be disabled.'
      });
    }

    const { error: updateErr } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}.`,
      data: { id, status }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update user status.'
    });
  }
};

module.exports = {
  getStatistics,
  getUsers,
  updateUserStatus
};
