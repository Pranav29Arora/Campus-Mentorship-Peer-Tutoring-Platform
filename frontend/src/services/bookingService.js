import apiClient from './apiClient';
import { storage } from '../utils/storage';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const bookingService = {
  getBookings: async (userId, role) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const bookings = storage.getBookings();

      if (role === 'admin') {
        return bookings;
      }

      if (role === 'mentor') {
        const mentors = storage.getMentors();
        const mentor = mentors.find(m => m.userId === userId);
        if (!mentor) return [];
        return bookings.filter(b => b.mentorId === mentor.id);
      }

      // Student role
      return bookings.filter(b => b.studentId === userId);
    } else {
      const response = await apiClient.get('/bookings');
      return response.data.data;
    }
  },

  createBooking: async (studentId, { mentorId, slotId }) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const bookings = storage.getBookings();
      const slots = storage.getAvailability();

      // Find availability slot
      const slotIndex = slots.findIndex(s => s.id === slotId && s.mentorId === mentorId);
      if (slotIndex === -1) {
        throw new Error('This slot is no longer available.');
      }

      const slot = slots[slotIndex];
      if (slot.status === 'booked') {
        throw new Error('This slot has already been booked.');
      }

      // Prevent overlapping bookings for same student
      const hasConflict = bookings.some(b => 
        b.studentId === studentId &&
        b.date === slot.date &&
        b.startTime === slot.startTime &&
        b.status === 'upcoming'
      );

      if (hasConflict) {
        throw new Error('You already have another tutoring session scheduled at this exact time.');
      }

      // Resolve mentor name
      const mentors = storage.getMentors();
      const mentor = mentors.find(m => m.id === mentorId);
      const mentorName = mentor ? mentor.name : 'Senior Mentor';

      // Update slot state to booked
      slots[slotIndex].status = 'booked';
      storage.setAvailability(slots);

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

      bookings.push(newBooking);
      storage.setBookings(bookings);

      // Create a successful in-app notification
      const notifs = storage.getNotifications();
      notifs.push({
        id: `notif_${Date.now()}`,
        userId: studentId,
        title: 'Booking Confirmed',
        message: `Your session with ${mentorName} on ${slot.date} is confirmed.`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      });
      storage.setNotifications(notifs);

      return newBooking;
    } else {
      const response = await apiClient.post('/bookings', { mentorId, slotId });
      return response.data.data;
    }
  },

  updateBookingStatus: async (bookingId, status, userId, role) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const bookings = storage.getBookings();
      const idx = bookings.findIndex(b => b.id === bookingId);

      if (idx === -1) {
        throw new Error('Booking record not found.');
      }

      const booking = bookings[idx];
      const oldStatus = booking.status;
      booking.status = status;

      // Handle cancels (free slot)
      if (status === 'cancelled' && oldStatus === 'upcoming') {
        const slots = storage.getAvailability();
        const slotIdx = slots.findIndex(s => 
          s.mentorId === booking.mentorId &&
          s.date === booking.date &&
          s.startTime === booking.startTime
        );
        if (slotIdx !== -1) {
          slots[slotIdx].status = 'available';
          storage.setAvailability(slots);
        }
      }

      // Handle completions (increment mentor stats)
      if (status === 'completed' && oldStatus === 'upcoming') {
        const mentors = storage.getMentors();
        const mentorIdx = mentors.findIndex(m => m.id === booking.mentorId);
        if (mentorIdx !== -1) {
          mentors[mentorIdx].totalSessions += 1;
          storage.setMentors(mentors);
        }
      }

      storage.setBookings(bookings);
      return booking;
    } else {
      const response = await apiClient.put(`/bookings/${bookingId}`, { status });
      return response.data.data;
    }
  }
};
