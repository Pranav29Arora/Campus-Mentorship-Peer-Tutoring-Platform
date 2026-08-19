const mentorService = require('../services/mentorService');

const getMentors = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      department: req.query.department,
      subject: req.query.subject,
      minRating: req.query.minRating,
      sortBy: req.query.sortBy
    };

    const mentors = await mentorService.getMentors(filters);
    res.status(200).json({
      success: true,
      data: mentors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mentors.',
      error: error.message
    });
  }
};

const getMentorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentorDetails = await mentorService.getMentorById(id);
    res.status(200).json({
      success: true,
      data: mentorDetails
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Mentor profile not found.'
    });
  }
};

module.exports = {
  getMentors,
  getMentorById
};
