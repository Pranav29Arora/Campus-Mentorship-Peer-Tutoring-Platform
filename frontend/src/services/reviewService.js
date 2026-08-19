import apiClient from './apiClient';
import { storage } from '../utils/storage';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const reviewService = {
  getReviews: async (mentorId) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const reviews = storage.getReviews();
      return reviews.filter(r => r.mentorId === mentorId);
    } else {
      const response = await apiClient.get(`/reviews/${mentorId}`);
      return response.data.data;
    }
  },

  createReview: async (studentId, { bookingId, rating, comment }) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const reviews = storage.getReviews();
      const bookings = storage.getBookings();
      const mentors = storage.getMentors();
      const users = storage.getUsers();

      // Find booking
      const bookingIdx = bookings.findIndex(b => b.id === bookingId);
      if (bookingIdx === -1) {
        throw new Error('Booking session not found.');
      }

      const booking = bookings[bookingIdx];
      if (booking.studentId !== studentId) {
        throw new Error('Unauthorized.');
      }

      if (booking.status !== 'completed') {
        throw new Error('You cannot review a session before it is completed.');
      }

      // Check duplicate review
      const duplicate = reviews.some(r => r.bookingId === bookingId);
      if (duplicate) {
        throw new Error('You have already submitted a review for this booking.');
      }

      const studentUser = users.find(u => u.id === studentId);
      const studentName = studentUser ? studentUser.name : 'Junior Student';

      const newReview = {
        id: `review_${Date.now()}`,
        bookingId,
        studentId,
        studentName,
        mentorId: booking.mentorId,
        rating: parseInt(rating),
        comment: comment || '',
        createdAt: new Date().toISOString()
      };

      reviews.push(newReview);
      storage.setReviews(reviews);

      // Recalculate average rating for the mentor
      const mentorReviews = reviews.filter(r => r.mentorId === booking.mentorId);
      const totalStars = mentorReviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = totalStars / mentorReviews.length;

      const mentorIdx = mentors.findIndex(m => m.id === booking.mentorId);
      if (mentorIdx !== -1) {
        mentors[mentorIdx].rating = parseFloat(avg.toFixed(1));
        storage.setMentors(mentors);
      }

      return newReview;
    } else {
      const response = await apiClient.post('/reviews', { bookingId, rating, comment });
      return response.data.data;
    }
  }
};
