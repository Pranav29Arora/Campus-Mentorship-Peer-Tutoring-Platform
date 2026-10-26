// In-Memory Database Store for the Express REST API.
// Allows the backend routes to perform fully dynamic operations (creating users, bookings, slot updates) in-memory.

const initialUsers = [
  {
    id: 'user001',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    rollNumber: '20BCSE014',
    passwordHash: '$2a$10$Xm5jSgGgR/t.Oa52v7oI0u7hL78D3G28aL893mH8P.gR2D03mU0S.', // bcrypt for 'password123'
    role: 'mentor',
    department: 'Computer Science',
    year: 4,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user002',
    name: 'Priya Singh',
    email: 'priya@example.com',
    rollNumber: '21BIT028',
    passwordHash: '$2a$10$Xm5jSgGgR/t.Oa52v7oI0u7hL78D3G28aL893mH8P.gR2D03mU0S.',
    role: 'mentor',
    department: 'Information Technology',
    year: 3,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user003',
    name: 'Amit Patel',
    email: 'amit@example.com',
    rollNumber: '20BECE045',
    passwordHash: '$2a$10$Xm5jSgGgR/t.Oa52v7oI0u7hL78D3G28aL893mH8P.gR2D03mU0S.',
    role: 'mentor',
    department: 'Electronics',
    year: 4,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'student_demo',
    name: 'Arjun Mehta',
    email: 'student@campusconnect.com',
    rollNumber: '22BCSE101',
    passwordHash: '$2a$10$Y1s1gT2F3G4h5J6k7L8m9oOpPqQrRsStTuUvVwWxXyYzZ12345678', // bcrypt placeholder
    role: 'student',
    department: 'Computer Science',
    year: 2,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mentor_demo',
    name: 'Rahul Sharma', // Linked to user001
    email: 'mentor@campusconnect.com',
    rollNumber: '20BCSE014',
    passwordHash: '$2a$10$Y1s1gT2F3G4h5J6k7L8m9oOpPqQrRsStTuUvVwWxXyYzZ12345678',
    role: 'mentor',
    department: 'Computer Science',
    year: 4,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin_demo',
    name: 'Prof. S. R. Iyer',
    email: 'admin@campusconnect.com',
    rollNumber: 'ADMIN-FAC-01',
    passwordHash: '$2a$10$Y1s1gT2F3G4h5J6k7L8m9oOpPqQrRsStTuUvVwWxXyYzZ12345678',
    role: 'admin',
    department: 'Administration',
    year: 0,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

const initialMentors = [
  {
    id: 'mentor001',
    userId: 'mentor_demo', // Rahul Sharma
    name: 'Rahul Sharma',
    email: 'mentor@campusconnect.com',
    rollNumber: '20BCSE014',
    department: 'Computer Science',
    year: 4,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    bio: 'Helping students understand programming through practical examples and data structures.',
    subjects: ['JavaScript', 'React', 'Data Structures', 'C++'],
    expertise: ['Frontend Development', 'Algorithms', 'Interview Preparation'],
    rating: 4.8,
    totalSessions: 124
  },
  {
    id: 'mentor002',
    userId: 'user002', // Priya Singh
    name: 'Priya Singh',
    email: 'priya@example.com',
    rollNumber: '21BIT028',
    department: 'Information Technology',
    year: 3,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Avid Python developer specializing in Machine Learning, database queries, and web frameworks.',
    subjects: ['Python', 'Machine Learning', 'Database Management', 'Java'],
    expertise: ['Data Science', 'Backend Development', 'Resume Building'],
    rating: 4.9,
    totalSessions: 98
  },
  {
    id: 'mentor003',
    userId: 'user003', // Amit Patel
    name: 'Amit Patel',
    email: 'amit@example.com',
    rollNumber: '20BECE045',
    department: 'Electronics',
    year: 4,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Hardware geek who can teach Computer Networks and Digital Design. Passionate about logic gates and router stacks.',
    subjects: ['Computer Networks', 'Java', 'Mathematics', 'Resume Building'],
    expertise: ['Networking', 'System Design', 'Career Guidance'],
    rating: 4.6,
    totalSessions: 72
  }
];

const initialAvailability = [];

const initialBookings = [];

const initialReviews = [];


// Active DB Stores
let users = [...initialUsers];
let mentors = [...initialMentors];
let availability = [...initialAvailability];
let bookings = [...initialBookings];
let reviews = [...initialReviews];
let notifications = [];

module.exports = {
  users,
  mentors,
  availability,
  bookings,
  reviews,
  notifications
};
