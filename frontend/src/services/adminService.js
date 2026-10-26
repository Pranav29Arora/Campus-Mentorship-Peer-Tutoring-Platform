import apiClient from './apiClient';
import { storage } from '../utils/storage';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const adminService = {
  getStatistics: async () => {
    if (USE_MOCK) {
      const allUsers = storage.getUsers();
      const allMentors = storage.getMentors();
      const allBookings = storage.getBookings();
      const allReviews = storage.getReviews();

      const totalStudents = allUsers.filter(u => u.role === 'student').length;
      const totalMentors = allMentors.length;
      const totalBookings = allBookings.length;
      const completedSessions = allBookings.filter(b => b.status === 'completed').length;
      const activeUsers = allUsers.filter(u => u.status === 'active').length;

      let avgRating = 5.0;
      if (allReviews.length > 0) {
        const sum = allReviews.reduce((t, r) => t + r.rating, 0);
        avgRating = parseFloat((sum / allReviews.length).toFixed(1));
      }

      const dateCounts = {};
      allBookings.forEach(b => {
        dateCounts[b.date] = (dateCounts[b.date] || 0) + 1;
      });

      const sessionsOverTime = Object.keys(dateCounts).map(date => ({
        date,
        count: dateCounts[date]
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      const subCounts = {};
      allBookings.forEach(b => {
        subCounts[b.subject] = (subCounts[b.subject] || 0) + 1;
      });

      const popularSubjects = Object.keys(subCounts).map(subject => ({
        subject,
        count: subCounts[subject]
      })).sort((a, b) => b.count - a.count).slice(0, 5);

      return {
        summary: {
          totalStudents,
          totalMentors,
          totalBookings,
          completedSessions,
          activeUsers,
          avgRating
        },
        charts: {
          sessionsOverTime,
          popularSubjects
        }
      };
    } else {
      const response = await apiClient.get('/admin/statistics');
      return response.data.data;
    }
  },

  getUsers: async () => {
    if (USE_MOCK) {
      return storage.getUsers();
    } else {
      const response = await apiClient.get('/admin/users');
      return response.data.data;
    }
  },

  updateUserStatus: async (userId, status) => {
    if (USE_MOCK) {
      const users = storage.getUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        users[idx].status = status;
        storage.setUsers(users);
      }
      return { id: userId, status };
    } else {
      const response = await apiClient.put(`/admin/users/${userId}/status`, { status });
      return response.data.data;
    }
  }
};
