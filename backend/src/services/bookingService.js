const db = require('./dbStore');
const notificationService = require('./notificationService');

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

  // Resolve student name
  const student = db.users.find(u => u.id === studentId);
  const studentName = student ? student.name : 'Junior Student';

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
    studentName,
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

  // Notify student
  await notificationService.createNotification(studentId, {
    title: 'Tutoring Session Scheduled',
    message: `Your tutoring session with ${mentorName} on ${slot.date} at ${slot.startTime} has been successfully booked.`,
    type: 'booking_created'
  });

  // Notify mentor
  if (mentor && mentor.userId) {
    await notificationService.createNotification(mentor.userId, {
      title: 'New Session Booked',
      message: `${studentName} has booked a session with you on ${slot.date} at ${slot.startTime}.`,
      type: 'booking_created'
    });
  }

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

    // Send cancellation notifications
    const targetMentor = db.mentors.find(m => m.id === booking.mentorId);
    if (role === 'student') {
      if (targetMentor) {
        await notificationService.createNotification(targetMentor.userId, {
          title: 'Session Cancelled By Student',
          message: `${booking.studentName} has cancelled the session scheduled on ${booking.date} at ${booking.startTime}.`,
          type: 'booking_cancelled'
        });
      }
    } else {
      await notificationService.createNotification(booking.studentId, {
        title: 'Session Cancelled By Mentor',
        message: `${booking.mentorName} has cancelled the session scheduled on ${booking.date} at ${booking.startTime}.`,
        type: 'booking_cancelled'
      });
    }
  }

  // If completed, increment mentor's totalSessions count
  if (status === 'completed' && oldStatus === 'upcoming') {
    const targetMentor = db.mentors.find(m => m.id === booking.mentorId);
    if (targetMentor) {
      targetMentor.totalSessions += 1;
    }

    // Notify student to leave a review
    await notificationService.createNotification(booking.studentId, {
      title: 'Session Completed',
      message: `Your tutoring session with ${booking.mentorName} is marked as completed. Please leave feedback on your dashboard.`,
      type: 'booking_completed'
    });
  }

  return booking;
};

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus
};
