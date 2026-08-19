const db = require('./dbStore');

const getBookings = async (userId, role) => {
  if (role === 'admin') {
    return db.bookings;
  }
  
  if (role === 'mentor') {
    // Resolve mentorId
    const mentor = db.mentors.find(m => m.userId === userId);
    if (!mentor) return [];
    return db.bookings.filter(b => b.mentorId === mentor.id);
  }

  // Else, student
  return db.bookings.filter(b => b.studentId === userId);
};

const createBooking = async (studentId, { mentorId, slotId }) => {
  // Find availability slot
  const slot = db.availability.find(s => s.id === slotId && s.mentorId === mentorId);
  if (!slot) {
    throw new Error('This slot is no longer available.');
  }

  if (slot.status === 'booked') {
    throw new Error('This slot has already been booked by another student.');
  }

  // Resolve mentor name
  const mentor = db.mentors.find(m => m.id === mentorId);
  const mentorName = mentor ? mentor.name : 'Senior Mentor';

  // Prevent duplicate booking for the same student on the same day & time
  const studentConflict = db.bookings.find(b => 
    b.studentId === studentId &&
    b.date === slot.date &&
    b.startTime === slot.startTime &&
    b.status === 'upcoming'
  );

  if (studentConflict) {
    throw new Error('You already have another tutoring session scheduled at this exact time.');
  }

  // Book the slot
  slot.status = 'booked';

  // Create booking record
  const newBooking = {
    id: `booking_${Date.now()}`,
    studentId,
    mentorId,
    mentorName,
    subject: slot.subject,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: 'upcoming',
    meetingStatus: 'disconnected',
    createdAt: new Date().toISOString()
  };

  db.bookings.push(newBooking);
  return newBooking;
};

const updateBookingStatus = async (userId, role, bookingId, { status }) => {
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) {
    throw new Error('Booking not found.');
  }

  // Authorization check
  const mentor = db.mentors.find(m => m.userId === userId);
  const isAuthorized = 
    role === 'admin' ||
    booking.studentId === userId ||
    (mentor && booking.mentorId === mentor.id);

  if (!isAuthorized) {
    throw new Error('Unauthorized action.');
  }

  const oldStatus = booking.status;
  booking.status = status;

  // If session cancelled, revert availability slot to 'available'
  if (status === 'cancelled' && oldStatus === 'upcoming') {
    const slot = db.availability.find(s => 
      s.mentorId === booking.mentorId && 
      s.date === booking.date && 
      s.startTime === booking.startTime
    );
    if (slot) {
      slot.status = 'available';
    }
  }

  // If completed, increment mentor's totalSessions count
  if (status === 'completed' && oldStatus === 'upcoming') {
    const mentor = db.mentors.find(m => m.id === booking.mentorId);
    if (mentor) {
      mentor.totalSessions += 1;
    }
  }

  return booking;
};

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus
};
