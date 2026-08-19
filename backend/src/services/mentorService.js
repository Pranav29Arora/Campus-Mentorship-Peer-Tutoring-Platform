const db = require('./dbStore');

const getMentors = async (filters = {}) => {
  let list = [...db.mentors];

  // Search query (matches name or bio)
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

  // Rating filter (e.g. min 4.5)
  if (filters.minRating) {
    const min = parseFloat(filters.minRating);
    list = list.filter(m => m.rating >= min);
  }

  // Sort settings
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
  const mentor = db.mentors.find(m => m.id === id);
  if (!mentor) {
    throw new Error('Mentor profile not found.');
  }

  // Fetch reviews linked to this mentor
  const reviews = db.reviews.filter(r => r.mentorId === id);

  return {
    ...mentor,
    reviews
  };
};

module.exports = {
  getMentors,
  getMentorById
};
