const db = require('../services/dbStore');

const getStatistics = async (req, res, next) => {
  try {
    const totalStudents = db.users.filter(u => u.role === 'student').length;
    const totalMentors = db.mentors.length;
    const totalBookings = db.bookings.length;
    const completedSessions = db.bookings.filter(b => b.status === 'completed').length;
    const activeUsers = db.users.filter(u => u.status === 'active').length;

    // Average rating given
    let avgRating = 0;
    if (db.reviews.length > 0) {
      avgRating = db.reviews.reduce((sum, r) => sum + r.rating, 0) / db.reviews.length;
      avgRating = parseFloat(avgRating.toFixed(2));
    }

    // Sessions over time (grouped by date)
    const bookingsByDate = {};
    db.bookings.forEach(b => {
      bookingsByDate[b.date] = (bookingsByDate[b.date] || 0) + 1;
    });

    const sessionsOverTime = Object.keys(bookingsByDate).map(date => ({
      date,
      count: bookingsByDate[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Popular subjects
    const subjectCounts = {};
    db.bookings.forEach(b => {
      subjectCounts[b.subject] = (subjectCounts[b.subject] || 0) + 1;
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
          totalMentors,
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
    // Filter passwordHash from users list for security
    const list = db.users.map(u => {
      const { passwordHash, ...userWithoutHash } = u;
      return userWithoutHash;
    });

    res.status(200).json({
      success: true,
      data: list
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

    const user = db.users.find(u => u.id === id);
    if (!user) {
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

    user.status = status;
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
