import apiClient from './apiClient';
import { storage } from '../utils/storage';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const authService = {
  login: async (email, password) => {
    if (USE_MOCK) {
      // Simulate API lag
      await new Promise(resolve => setTimeout(resolve, 500));

      const users = storage.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        throw new Error('Invalid email or password.');
      }

      if (user.status === 'disabled') {
        throw new Error('Your account has been suspended by the administrator.');
      }

      // Check passwords: simple comparison for mock demo accounts
      const isValid = (email === 'student@campusconnect.com' && password === 'student123') ||
                      (email === 'mentor@campusconnect.com' && password === 'mentor123') ||
                      (email === 'admin@campusconnect.com' && password === 'admin123') ||
                      (password === 'password123'); // fallback default for other generated mocks

      if (!isValid) {
        throw new Error('Invalid email or password.');
      }

      // Find linked mentorId if the role is mentor
      let mentorId = null;
      if (user.role === 'mentor') {
        const mentors = storage.getMentors();
        const mentorProfile = mentors.find(m => m.userId === user.id);
        if (mentorProfile) mentorId = mentorProfile.id;
      }

      const token = `mock-token-${user.role}`;
      const authData = { ...user, mentorId };

      storage.setCurrentUser(authData);
      storage.setToken(token);

      return { user: authData, token };
    } else {
      // Call Express REST endpoint
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { user, token } = response.data.data;
        storage.setCurrentUser(user);
        storage.setToken(token);
        return { user, token };
      }
      throw new Error(response.data.message || 'Login failed.');
    }
  },

  register: async (userData) => {
    if (!userData.rollNumber || !userData.rollNumber.trim()) {
      throw new Error('University Roll Number is mandatory to register.');
    }

    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const users = storage.getUsers();

      const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (exists) {
        throw new Error('An account with this email address already exists.');
      }

      const rollExists = users.some(u => u.rollNumber && u.rollNumber.toLowerCase() === userData.rollNumber.trim().toLowerCase());
      if (rollExists) {
        throw new Error('An account with this University Roll Number already exists.');
      }

      const newUserId = `user_${Date.now()}`;
      const newUser = {
        id: newUserId,
        name: userData.name,
        email: userData.email,
        rollNumber: userData.rollNumber.trim().toUpperCase(),
        role: userData.role,
        department: userData.department,
        year: parseInt(userData.year) || 1,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // Add to users
      users.push(newUser);
      storage.setUsers(users);

      let mentorId = null;
      // If mentor, provision mentor profile
      if (userData.role === 'mentor') {
        const mentors = storage.getMentors();
        mentorId = `mentor_${Date.now()}`;
        const newMentor = {
          id: mentorId,
          userId: newUserId,
          name: newUser.name,
          email: newUser.email,
          rollNumber: newUser.rollNumber,
          department: newUser.department,
          year: newUser.year,
          avatar: newUser.avatar,
          bio: userData.bio || 'Experienced student ready to help peers.',
          subjects: userData.subjects || [],
          expertise: userData.expertise || [],
          rating: 5.0,
          totalSessions: 0
        };
        mentors.push(newMentor);
        storage.setMentors(mentors);
      }

      const token = `mock-token-${newUser.role}`;
      const authData = { ...newUser, mentorId };

      storage.setCurrentUser(authData);
      storage.setToken(token);

      return { user: authData, token };
    } else {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data && response.data.success) {
        const { user, token } = response.data.data;
        storage.setCurrentUser(user);
        storage.setToken(token);
        return { user, token };
      }
      throw new Error(response.data.message || 'Registration failed.');
    }
  },

  logout: async () => {
    storage.clearAuth();
    return true;
  },

  getCurrentUser: () => {
    return storage.getCurrentUser();
  }
};
