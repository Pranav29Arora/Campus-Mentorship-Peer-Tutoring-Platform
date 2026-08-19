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
    userId: 'user001', // Rahul Sharma
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
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

const initialAvailability = [
  {
    id: 'slot001',
    mentorId: 'mentor001', // Rahul Sharma
    date: '2026-08-20',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    status: 'available',
    subject: 'JavaScript'
  },
  {
    id: 'slot002',
    mentorId: 'mentor001',
    date: '2026-08-20',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    status: 'available',
    subject: 'React'
  },
  {
    id: 'slot003',
    mentorId: 'mentor002', // Priya Singh
    date: '2026-08-20',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    status: 'available',
    subject: 'Python'
  },
  {
    id: 'slot004',
    mentorId: 'mentor002',
    date: '2026-08-21',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    status: 'available',
    subject: 'Machine Learning'
  }
];

const initialBookings = [
  {
    id: 'booking001',
    studentId: 'student_demo',
    mentorId: 'mentor001',
    mentorName: 'Rahul Sharma',
    subject: 'JavaScript',
    date: '2026-08-18',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    status: 'completed',
    meetingStatus: 'disconnected',
    createdAt: new Date().toISOString()
  },
  {
    id: 'booking002',
    studentId: 'student_demo',
    mentorId: 'mentor002',
    mentorName: 'Priya Singh',
    subject: 'Python',
    date: '2026-08-20',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    status: 'upcoming',
    meetingStatus: 'disconnected',
    createdAt: new Date().toISOString()
  }
];

const initialReviews = [
  {
    id: 'review001',
    bookingId: 'booking001',
    studentId: 'student_demo',
    studentName: 'Arjun Mehta',
    mentorId: 'mentor001',
    rating: 5,
    comment: ' Rahul explained JavaScript Closures and Callbacks so well! The practical examples made everything simple to grasp. Highly recommend him.',
    createdAt: new Date().toISOString()
  }
];

// Active DB Stores
let users = [...initialUsers];
let mentors = [...initialMentors];
let availability = [...initialAvailability];
let bookings = [...initialBookings];
let reviews = [...initialReviews];

module.exports = {
  users,
  mentors,
  availability,
  bookings,
  reviews
};
