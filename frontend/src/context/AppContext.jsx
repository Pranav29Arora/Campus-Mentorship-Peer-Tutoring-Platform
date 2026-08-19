import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { mentorService } from '../services/mentorService';
import { bookingService } from '../services/bookingService';
import { availabilityService } from '../services/availabilityService';
import { reviewService } from '../services/reviewService';
import { notificationService } from '../services/notificationService';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [mentors, setMentors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load notifications and bookings when user state changes
  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchNotifications();
    } else {
      setBookings([]);
      setNotifications([]);
    }
  }, [user]);

  const fetchMentors = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mentorService.getMentors(filters);
      setMentors(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch mentors list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const data = await bookingService.getBookings(user.id, user.role);
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const createBooking = async (mentorId, slotId) => {
    if (!user) throw new Error('You must be logged in to book a session.');
    setLoading(true);
    setError(null);
    try {
      const newBooking = await bookingService.createBooking(user.id, { mentorId, slotId });
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch (err) {
      setError(err.message || 'Booking failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!user) return;
    setLoading(true);
    try {
      const updated = await bookingService.updateBookingStatus(bookingId, 'cancelled', user.id, user.role);
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeBooking = async (bookingId) => {
    if (!user) return;
    setLoading(true);
    try {
      const updated = await bookingService.updateBookingStatus(bookingId, 'completed', user.id, user.role);
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    } catch (err) {
      setError(err.message || 'Failed to mark booking completed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (mentorId) => {
    try {
      const slots = await availabilityService.getAvailableSlots(mentorId);
      setAvailability(slots);
      return slots;
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      return [];
    }
  };

  const addAvailabilitySlot = async (slotData) => {
    if (!user || user.role !== 'mentor') return;
    setLoading(true);
    try {
      const newSlot = await availabilityService.createSlot(user.mentorId, slotData);
      setAvailability(prev => [...prev, newSlot]);
      return newSlot;
    } catch (err) {
      setError(err.message || 'Failed to add availability slot.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAvailabilitySlot = async (slotId) => {
    if (!user || user.role !== 'mentor') return;
    setLoading(true);
    try {
      await availabilityService.deleteSlot(slotId, user.mentorId);
      setAvailability(prev => prev.filter(s => s.id !== slotId));
    } catch (err) {
      setError(err.message || 'Failed to delete slot.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (bookingId, rating, comment) => {
    if (!user) return;
    setLoading(true);
    try {
      const review = await reviewService.createReview(user.id, { bookingId, rating, comment });
      // Update booking list to reflect the new completed state if needed
      await fetchBookings();
      return review;
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const readNotification = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark read notification:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AppContext.Provider value={{
      mentors,
      bookings,
      availability,
      notifications,
      loading,
      error,
      fetchMentors,
      fetchBookings,
      createBooking,
      cancelBooking,
      completeBooking,
      fetchAvailability,
      addAvailabilitySlot,
      deleteAvailabilitySlot,
      submitReview,
      readNotification,
      clearError
    }}>
      {children}
    </AppContext.Provider>
  );
};
