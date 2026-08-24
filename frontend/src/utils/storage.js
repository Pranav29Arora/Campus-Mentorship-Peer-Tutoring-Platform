import { mockUsers } from '../data/mockUsers';
import { mockMentors } from '../data/mockMentors';
import { mockAvailability } from '../data/mockAvailability';
import { mockBookings } from '../data/mockBookings';
import { mockReviews } from '../data/mockReviews';
import { mockNotifications } from '../data/mockNotifications';

const KEYS = {
  USERS: 'cc_users',
  MENTORS: 'cc_mentors',
  AVAILABILITY: 'cc_availability',
  BOOKINGS: 'cc_bookings',
  REVIEWS: 'cc_reviews',
  NOTIFICATIONS: 'cc_notifications',
  CURRENT_USER: 'cc_current_user',
  TOKEN: 'cc_auth_token'
};

// Initialize localStorage with mock data if not already set
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(KEYS.MENTORS)) {
    localStorage.setItem(KEYS.MENTORS, JSON.stringify(mockMentors));
  }
  if (!localStorage.getItem(KEYS.AVAILABILITY)) {
    localStorage.setItem(KEYS.AVAILABILITY, JSON.stringify(mockAvailability));
  }
  if (!localStorage.getItem(KEYS.BOOKINGS)) {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(mockBookings));
  }
  if (!localStorage.getItem(KEYS.REVIEWS)) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(mockReviews));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(mockNotifications));
  }
};

// Run initialization immediately
initStorage();

export const storage = {
  getUsers: () => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  setUsers: (data) => localStorage.setItem(KEYS.USERS, JSON.stringify(data)),

  getMentors: () => JSON.parse(localStorage.getItem(KEYS.MENTORS) || '[]'),
  setMentors: (data) => localStorage.setItem(KEYS.MENTORS, JSON.stringify(data)),

  getAvailability: () => JSON.parse(localStorage.getItem(KEYS.AVAILABILITY) || '[]'),
  setAvailability: (data) => localStorage.setItem(KEYS.AVAILABILITY, JSON.stringify(data)),

  getBookings: () => JSON.parse(localStorage.getItem(KEYS.BOOKINGS) || '[]'),
  setBookings: (data) => localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(data)),

  getReviews: () => JSON.parse(localStorage.getItem(KEYS.REVIEWS) || '[]'),
  setReviews: (data) => localStorage.setItem(KEYS.REVIEWS, JSON.stringify(data)),

  getNotifications: () => JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || '[]'),
  setNotifications: (data) => localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(data)),

  getCurrentUser: () => JSON.parse(sessionStorage.getItem(KEYS.CURRENT_USER) || 'null'),
  setCurrentUser: (data) => sessionStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(data)),

  getToken: () => sessionStorage.getItem(KEYS.TOKEN) || 'null',
  setToken: (token) => sessionStorage.setItem(KEYS.TOKEN, token),
  
  clearAuth: () => {
    sessionStorage.removeItem(KEYS.CURRENT_USER);
    sessionStorage.removeItem(KEYS.TOKEN);
  }
};
