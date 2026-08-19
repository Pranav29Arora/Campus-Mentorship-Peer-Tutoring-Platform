import apiClient from './apiClient';
import { storage } from '../utils/storage';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const mentorService = {
  getMentors: async (filters = {}) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let list = storage.getMentors();

      // Search Query filter
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
        list = list.filter(m => m.subjects.some(sub => sub.toLowerCase() === filters.subject.toLowerCase()));
      }

      // Minimum rating filter
      if (filters.minRating) {
        const ratingVal = parseFloat(filters.minRating);
        list = list.filter(m => m.rating >= ratingVal);
      }

      // Sorting
      if (filters.sortBy) {
        if (filters.sortBy === 'rating') {
          list.sort((a, b) => b.rating - a.rating);
        } else if (filters.sortBy === 'sessions') {
          list.sort((a, b) => b.totalSessions - a.totalSessions);
        }
      }

      return list;
    } else {
      const response = await apiClient.get('/mentors', { params: filters });
      return response.data.data;
    }
  },

  getMentorById: async (id) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const mentors = storage.getMentors();
      const mentor = mentors.find(m => m.id === id);

      if (!mentor) {
        throw new Error('Mentor profile not found.');
      }

      // Link reviews and availability slots
      const reviews = storage.getReviews().filter(r => r.mentorId === id);
      const slots = storage.getAvailability().filter(s => s.mentorId === id);

      return {
        ...mentor,
        reviews,
        availability: slots
      };
    } else {
      const response = await apiClient.get(`/mentors/${id}`);
      return response.data.data;
    }
  },

  updateMentorProfile: async (mentorId, updateData) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const mentors = storage.getMentors();
      const idx = mentors.findIndex(m => m.id === mentorId);

      if (idx === -1) {
        throw new Error('Mentor profile not found.');
      }

      mentors[idx] = {
        ...mentors[idx],
        ...updateData
      };

      storage.setMentors(mentors);
      return mentors[idx];
    } else {
      const response = await apiClient.put(`/mentors/${mentorId}`, updateData);
      return response.data.data;
    }
  }
};
