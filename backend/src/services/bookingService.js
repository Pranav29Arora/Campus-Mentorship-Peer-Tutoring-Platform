const supabase = require('../config/supabase');
const notificationService = require('./notificationService');
const { sendBookingEmail } = require('../utils/sendEmail');
const { emitBookingUpdate, emitAvailabilityUpdate } = require('../utils/socketEmitter');

const formatBooking = (b) => {
  const studentName = b.student?.name || 'Junior Student';
  const mentorName = b.mentor?.users?.name || 'Senior Mentor';
  return {
    id: b.id,
    studentId: b.student_id,
    studentName,
    mentorId: b.mentor_id,
    mentorName,
    subject: b.subject,
    date: b.date,
    startTime: b.start_time,
    endTime: b.end_time,
    status: b.status,
    meetingStatus: b.meeting_status,
    isReviewed: !!b.is_reviewed,
    createdAt: b.created_at
  };
};

const getBookings = async (userId, role) => {
  let query = supabase
    .from('bookings')
    .select(`
      id,
      student_id,
      mentor_id,
      subject,
      date,
      start_time,
      end_time,
      status,
      meeting_status,
      is_reviewed,
      created_at,
      student:student_id (
        id,
        name,
        email
      ),
      mentor:mentor_id (
        id,
        user_id,
        users:user_id (
          name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (role === 'admin') {
    // Admin sees all
  } else if (role === 'mentor') {
    // Find mentor profile ID for this user
    const { data: mentor } = await supabase
      .from('mentors')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!mentor) return [];
    query = query.eq('mentor_id', mentor.id);
  } else {
    // Student sees their bookings
    query = query.eq('student_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return (data || []).map(formatBooking);
};

const createBooking = async (studentId, { mentorId, slotId }) => {
  // 1. Find availability slot
  const { data: slot, error: slotErr } = await supabase
    .from('availability')
    .select('*')
    .eq('id', slotId)
    .eq('mentor_id', mentorId)
    .maybeSingle();

  if (slotErr || !slot) {
    throw new Error('This slot is no longer available.');
  }

  if (slot.status === 'booked') {
    throw new Error('This slot has already been booked by another student.');
  }

  // 2. Fetch mentor details
  let { data: mentor } = await supabase
    .from('mentors')
    .select('id, user_id, users:user_id (name, email)')
    .eq('id', mentorId)
    .maybeSingle();

  if (!mentor) {
    const { data: mentorByUserId } = await supabase
      .from('mentors')
      .select('id, user_id, users:user_id (name, email)')
      .eq('user_id', mentorId)
      .maybeSingle();
    if (mentorByUserId) mentor = mentorByUserId;
  }

  let mentorName = mentor?.users?.name;
  let mentorEmail = mentor?.users?.email;

  if ((!mentorName || !mentorEmail) && mentor?.user_id) {
    const { data: mentorUser } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', mentor.user_id)
      .maybeSingle();
    if (mentorUser) {
      mentorName = mentorName || mentorUser.name;
      mentorEmail = mentorEmail || mentorUser.email;
    }
  }

  mentorName = mentorName || 'Senior Mentor';
  mentorEmail = mentorEmail || '';

  // 3. Fetch student details
  const { data: student } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', studentId)
    .maybeSingle();

  const studentName = student?.name || 'Junior Student';
  const studentEmail = student?.email || '';

  // 4. Prevent duplicate booking for the same student on the same day & time
  const { data: conflict } = await supabase
    .from('bookings')
    .select('id')
    .eq('student_id', studentId)
    .eq('date', slot.date)
    .eq('start_time', slot.start_time)
    .eq('status', 'upcoming')
    .maybeSingle();

  if (conflict) {
    throw new Error('You already have another tutoring session scheduled at this exact time.');
  }

  // 5. Update slot status to 'booked'
  await supabase
    .from('availability')
    .update({ status: 'booked' })
    .eq('id', slotId);

  // 6. Create booking record
  const bookingId = `booking_${Date.now()}`;
  const newBookingRow = {
    id: bookingId,
    student_id: studentId,
    mentor_id: mentorId,
    subject: slot.subject || 'General Mentorship',
    date: slot.date,
    start_time: slot.start_time,
    end_time: slot.end_time,
    status: 'upcoming',
    meeting_status: 'disconnected',
    is_reviewed: false,
    created_at: new Date().toISOString()
  };

  const { error: insertErr } = await supabase
    .from('bookings')
    .insert([newBookingRow]);

  if (insertErr) {
    // Revert slot status if booking failed
    await supabase.from('availability').update({ status: 'available' }).eq('id', slotId);
    throw new Error(`Failed to create booking: ${insertErr.message}`);
  }

  const resultBooking = {
    id: bookingId,
    studentId,
    studentName,
    mentorId,
    mentorName,
    subject: slot.subject,
    date: slot.date,
    startTime: slot.start_time,
    endTime: slot.end_time,
    status: 'upcoming',
    meetingStatus: 'disconnected',
    isReviewed: false,
    createdAt: newBookingRow.created_at
  };

  // 7. Notify student
  await notificationService.createNotification(studentId, {
    title: 'Tutoring Session Scheduled',
    message: `Your tutoring session with ${mentorName} on ${slot.date} at ${slot.start_time} has been successfully booked.`,
    type: 'booking_created'
  });

  // 8. Notify mentor
  if (mentor && mentor.user_id) {
    await notificationService.createNotification(mentor.user_id, {
      title: 'New Session Booked',
      message: `${studentName} has booked a session with you on ${slot.date} at ${slot.start_time}.`,
      type: 'booking_created'
    });
  }

  // 9. Send email notification to mentor & confirmation to student
  console.log(`[Booking] Triggering session emails -> Mentor: ${mentorEmail} (${mentorName}), Student: ${studentEmail} (${studentName})`);
  try {
    await sendBookingEmail(
      { name: mentorName, email: mentorEmail },
      { name: studentName, email: studentEmail },
      {
        date: slot.date,
        startTime: slot.start_time,
        endTime: slot.end_time,
        subject: slot.subject
      }
    );
  } catch (emailErr) {
    console.error('[Email Error] Failed to send booking notification email:', emailErr.message || emailErr);
  }

  // 10. Broadcast real-time update to all connected clients
  emitBookingUpdate('created', { booking: resultBooking, mentorId, studentId });
  emitAvailabilityUpdate('booked', { mentorId, slotId, date: slot.date, startTime: slot.start_time });

  return resultBooking;
};

const updateBookingStatus = async (userId, role, bookingId, { status }) => {
  // Fetch booking with details
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select(`
      id,
      student_id,
      mentor_id,
      subject,
      date,
      start_time,
      end_time,
      status,
      meeting_status,
      is_reviewed,
      student:student_id (name),
      mentor:mentor_id (
        id,
        user_id,
        users:user_id (name)
      )
    `)
    .eq('id', bookingId)
    .maybeSingle();

  if (fetchErr || !booking) {
    throw new Error('Booking not found.');
  }

  // Authorization check
  const isStudent = booking.student_id === userId;
  const isMentor = booking.mentor?.user_id === userId;
  const isAdmin = role === 'admin';

  if (!isStudent && !isMentor && !isAdmin) {
    throw new Error('Unauthorized action.');
  }

  const oldStatus = booking.status;

  // Update status in Supabase
  const { error: updateErr } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  if (updateErr) {
    throw new Error(`Failed to update booking status: ${updateErr.message}`);
  }

  const studentName = booking.student?.name || 'Junior Student';
  const mentorName = booking.mentor?.users?.name || 'Senior Mentor';

  // If session cancelled, revert availability slot to 'available'
  if (status === 'cancelled' && oldStatus === 'upcoming') {
    await supabase
      .from('availability')
      .update({ status: 'available' })
      .eq('mentor_id', booking.mentor_id)
      .eq('date', booking.date)
      .eq('start_time', booking.start_time);

    // Send cancellation notifications
    if (role === 'student' && booking.mentor?.user_id) {
      await notificationService.createNotification(booking.mentor.user_id, {
        title: 'Session Cancelled By Student',
        message: `${studentName} has cancelled the session scheduled on ${booking.date} at ${booking.start_time}.`,
        type: 'booking_cancelled'
      });
    } else {
      await notificationService.createNotification(booking.student_id, {
        title: 'Session Cancelled By Mentor',
        message: `${mentorName} has cancelled the session scheduled on ${booking.date} at ${booking.start_time}.`,
        type: 'booking_cancelled'
      });
    }
  }

  // If completed, increment mentor's total_sessions count
  if (status === 'completed' && oldStatus === 'upcoming') {
    const { data: mentorRow } = await supabase
      .from('mentors')
      .select('total_sessions')
      .eq('id', booking.mentor_id)
      .maybeSingle();

    const newSessionsCount = (mentorRow?.total_sessions || 0) + 1;
    await supabase
      .from('mentors')
      .update({ total_sessions: newSessionsCount })
      .eq('id', booking.mentor_id);

    // Notify student to leave a review
    await notificationService.createNotification(booking.student_id, {
      title: 'Session Completed',
      message: `Your tutoring session with ${mentorName} is marked as completed. Please leave feedback on your dashboard.`,
      type: 'booking_completed'
    });
  }

  // Broadcast real-time update
  emitBookingUpdate(status, { bookingId, status, mentorId: booking.mentor_id, studentId: booking.student_id });
  if (status === 'cancelled') {
    emitAvailabilityUpdate('freed', { mentorId: booking.mentor_id, date: booking.date, startTime: booking.start_time });
  }

  return {
    ...formatBooking(booking),
    status
  };
};

const deleteBooking = async (userId, role, bookingId) => {
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select(`
      id,
      student_id,
      mentor_id,
      date,
      start_time,
      status,
      mentor:mentor_id (user_id)
    `)
    .eq('id', bookingId)
    .maybeSingle();

  if (fetchErr || !booking) {
    throw new Error('Booking not found.');
  }

  const isStudent = booking.student_id === userId;
  const isMentor = booking.mentor?.user_id === userId;
  const isAdmin = role === 'admin';

  if (!isStudent && !isMentor && !isAdmin) {
    throw new Error('Unauthorized action.');
  }

  // Delete the booking
  const { error: deleteErr } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (deleteErr) {
    throw new Error(`Failed to delete session: ${deleteErr.message}`);
  }

  // If this was an upcoming session, revert availability slot back to 'available'
  if (booking.status === 'upcoming') {
    await supabase
      .from('availability')
      .update({ status: 'available' })
      .eq('mentor_id', booking.mentor_id)
      .eq('date', booking.date)
      .eq('start_time', booking.start_time);

    emitAvailabilityUpdate('freed', { mentorId: booking.mentor_id, date: booking.date, startTime: booking.start_time });
  }

  // Broadcast deletion
  emitBookingUpdate('deleted', { bookingId, mentorId: booking.mentor_id, studentId: booking.student_id });

  return { success: true, message: 'Session deleted successfully.' };
};

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking
};
