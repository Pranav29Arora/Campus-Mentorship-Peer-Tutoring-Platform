const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

async function seed() {
  console.log('🌱 Starting Supabase database seeding for CampusConnect...');

  // Hash passwords
  const studentPwdHash = bcrypt.hashSync('student123', 10);
  const mentorPwdHash = bcrypt.hashSync('mentor123', 10);
  const adminPwdHash = bcrypt.hashSync('admin123', 10);
  const defaultPwdHash = bcrypt.hashSync('password123', 10);

  // 1. Initial Users
  const users = [
    {
      id: 'student_demo',
      name: 'Arjun Mehta',
      email: 'student@campusconnect.com',
      roll_number: '22BCSE101',
      password_hash: studentPwdHash,
      role: 'student',
      department: 'Computer Science',
      year: 2,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      status: 'active'
    },
    {
      id: 'mentor_demo',
      name: 'Rahul Sharma',
      email: 'mentor@campusconnect.com',
      roll_number: '20BCSE014',
      password_hash: mentorPwdHash,
      role: 'mentor',
      department: 'Computer Science',
      year: 4,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      status: 'active'
    },
    {
      id: 'admin_demo',
      name: 'Prof. S. R. Iyer',
      email: 'admin@campusconnect.com',
      roll_number: 'ADMIN-FAC-01',
      password_hash: adminPwdHash,
      role: 'admin',
      department: 'Administration',
      year: 0,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      status: 'active'
    },
    {
      id: 'user001',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      roll_number: '20BCSE014-ALT',
      password_hash: defaultPwdHash,
      role: 'mentor',
      department: 'Computer Science',
      year: 4,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      status: 'active'
    },
    {
      id: 'user002',
      name: 'Priya Singh',
      email: 'priya@example.com',
      roll_number: '21BIT028',
      password_hash: defaultPwdHash,
      role: 'mentor',
      department: 'Information Technology',
      year: 3,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      status: 'active'
    },
    {
      id: 'user003',
      name: 'Amit Patel',
      email: 'amit@example.com',
      roll_number: '20BECE045',
      password_hash: defaultPwdHash,
      role: 'mentor',
      department: 'Electronics',
      year: 4,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'active'
    }
  ];

  console.log('Inserting users...');
  const { error: userError } = await supabase.from('users').upsert(users, { onConflict: 'id' });
  if (userError) {
    console.error('Error seeding users:', userError);
    return;
  }
  console.log(`✅ ${users.length} users seeded.`);

  // 2. Initial Mentors
  const mentors = [
    {
      id: 'mentor001',
      user_id: 'mentor_demo',
      bio: 'Helping junior students master Data Structures, C++, and Web Development through hands-on practice.',
      subjects: ['JavaScript', 'React', 'Data Structures', 'C++'],
      expertise: ['Frontend Development', 'Algorithms', 'Interview Preparation'],
      rating: 4.80,
      total_sessions: 124
    },
    {
      id: 'mentor002',
      user_id: 'user002',
      bio: 'Avid Python developer specializing in Machine Learning, database queries, and web frameworks.',
      subjects: ['Python', 'Machine Learning', 'Database Management', 'Java'],
      expertise: ['Data Science', 'Backend Development', 'Resume Building'],
      rating: 4.90,
      total_sessions: 98
    },
    {
      id: 'mentor003',
      user_id: 'user003',
      bio: 'Hardware geek who can teach Computer Networks and Digital Design. Passionate about logic gates and router stacks.',
      subjects: ['Computer Networks', 'Java', 'Mathematics', 'Resume Building'],
      expertise: ['Networking', 'System Design', 'Career Guidance'],
      rating: 4.60,
      total_sessions: 72
    }
  ];

  console.log('Inserting mentors...');
  const { error: mentorError } = await supabase.from('mentors').upsert(mentors, { onConflict: 'id' });
  if (mentorError) {
    console.error('Error seeding mentors:', mentorError);
    return;
  }
  console.log(`✅ ${mentors.length} mentors seeded.`);

  // 3. Initial Availability Slots
  // Generate dates: today + 1 day, today + 2 days, today + 3 days
  const today = new Date();
  const getDateStr = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const day1 = getDateStr(1);
  const day2 = getDateStr(2);
  const day3 = getDateStr(3);

  const availabilitySlots = [
    {
      id: 'slot001',
      mentor_id: 'mentor001',
      date: day1,
      start_time: '10:00',
      end_time: '11:00',
      status: 'available',
      subject: 'Data Structures'
    },
    {
      id: 'slot002',
      mentor_id: 'mentor001',
      date: day1,
      start_time: '14:00',
      end_time: '15:00',
      status: 'booked',
      subject: 'React & Frontend'
    },
    {
      id: 'slot003',
      mentor_id: 'mentor001',
      date: day2,
      start_time: '11:00',
      end_time: '12:00',
      status: 'available',
      subject: 'C++ Programming'
    },
    {
      id: 'slot004',
      mentor_id: 'mentor002',
      date: day1,
      start_time: '15:00',
      end_time: '16:00',
      status: 'available',
      subject: 'Python & Machine Learning'
    },
    {
      id: 'slot005',
      mentor_id: 'mentor002',
      date: day2,
      start_time: '16:00',
      end_time: '17:00',
      status: 'available',
      subject: 'Database Management'
    },
    {
      id: 'slot006',
      mentor_id: 'mentor003',
      date: day3,
      start_time: '09:00',
      end_time: '10:00',
      status: 'available',
      subject: 'Computer Networks'
    }
  ];

  console.log('Inserting availability slots...');
  const { error: slotError } = await supabase.from('availability').upsert(availabilitySlots, { onConflict: 'id' });
  if (slotError) {
    console.error('Error seeding availability:', slotError);
    return;
  }
  console.log(`✅ ${availabilitySlots.length} availability slots seeded.`);

  // 4. Initial Bookings
  const bookings = [
    {
      id: 'booking001',
      student_id: 'student_demo',
      mentor_id: 'mentor001',
      subject: 'React & Frontend',
      date: day1,
      start_time: '14:00',
      end_time: '15:00',
      status: 'upcoming',
      meeting_status: 'disconnected',
      is_reviewed: false
    },
    {
      id: 'booking002',
      student_id: 'student_demo',
      mentor_id: 'mentor001',
      subject: 'Data Structures - Binary Trees',
      date: getDateStr(-2),
      start_time: '10:00',
      end_time: '11:00',
      status: 'completed',
      meeting_status: 'disconnected',
      is_reviewed: true
    },
    {
      id: 'booking003',
      student_id: 'student_demo',
      mentor_id: 'mentor002',
      subject: 'Python Functions & Recursion',
      date: getDateStr(-5),
      start_time: '15:00',
      end_time: '16:00',
      status: 'completed',
      meeting_status: 'disconnected',
      is_reviewed: true
    }
  ];

  console.log('Inserting sample bookings...');
  const { error: bookingError } = await supabase.from('bookings').upsert(bookings, { onConflict: 'id' });
  if (bookingError) {
    console.error('Error seeding bookings:', bookingError);
    return;
  }
  console.log(`✅ ${bookings.length} sample bookings seeded.`);

  // 5. Initial Reviews
  const reviews = [
    {
      id: 'review001',
      booking_id: 'booking002',
      student_id: 'student_demo',
      mentor_id: 'mentor001',
      rating: 5,
      comment: 'Rahul explained tree traversals with visual recursion trees. Cleared my doubts for tomorrow viva!'
    },
    {
      id: 'review002',
      booking_id: 'booking003',
      student_id: 'student_demo',
      mentor_id: 'mentor002',
      rating: 5,
      comment: 'Priya helped me debug my pandas data pipeline. Super patient and knowledgeable mentor.'
    }
  ];

  console.log('Inserting sample reviews...');
  const { error: reviewError } = await supabase.from('reviews').upsert(reviews, { onConflict: 'id' });
  if (reviewError) {
    console.error('Error seeding reviews:', reviewError);
    return;
  }
  console.log(`✅ ${reviews.length} sample reviews seeded.`);

  // 6. Initial Notifications
  const notifications = [
    {
      id: 'notif001',
      user_id: 'student_demo',
      title: 'Session Scheduled',
      message: 'Your peer tutoring session with Rahul Sharma on React & Frontend is scheduled.',
      type: 'booking_created',
      read: false
    },
    {
      id: 'notif002',
      user_id: 'mentor_demo',
      title: 'New Student Booking',
      message: 'Arjun Mehta has booked a session on React & Frontend for tomorrow at 14:00.',
      type: 'booking_created',
      read: false
    }
  ];

  console.log('Inserting notifications...');
  const { error: notifError } = await supabase.from('notifications').upsert(notifications, { onConflict: 'id' });
  if (notifError) {
    console.error('Error seeding notifications:', notifError);
    return;
  }
  console.log(`✅ ${notifications.length} notifications seeded.`);

  console.log('✨ All Supabase database tables successfully populated!');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
