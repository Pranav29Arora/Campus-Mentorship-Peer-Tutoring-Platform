import apiClient from './apiClient';
import { storage } from '../utils/storage';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const notificationService = {
  getNotifications: async (userId) => {
    if (USE_MOCK) {
      const allNotifs = storage.getNotifications();
      return allNotifs.filter(n => n.userId === userId);
    } else {
      const response = await apiClient.get('/notifications');
      return response.data.data;
    }
  },

  markAsRead: async (notifId) => {
    if (USE_MOCK) {
      const allNotifs = storage.getNotifications();
      const idx = allNotifs.findIndex(n => n.id === notifId);
      if (idx !== -1) {
        allNotifs[idx].read = true;
        storage.setNotifications(allNotifs);
      }
      return true;
    } else {
      const response = await apiClient.put(`/notifications/${notifId}/read`);
      return response.data.data;
    }
  }
};
