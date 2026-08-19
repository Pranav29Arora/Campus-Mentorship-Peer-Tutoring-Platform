import apiClient from './apiClient';
import { storage } from '../utils/storage';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const availabilityService = {
  getAvailableSlots: async (mentorId) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const slots = storage.getAvailability();
      return slots.filter(slot => slot.mentorId === mentorId);
    } else {
      const response = await apiClient.get(`/availability/${mentorId}`);
      return response.data.data;
    }
  },

  createSlot: async (mentorId, { date, startTime, endTime, subject }) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const slots = storage.getAvailability();

      // Check duplicate slot overlap
      const duplicate = slots.find(s => 
        s.mentorId === mentorId &&
        s.date === date &&
        s.startTime === startTime
      );

      if (duplicate) {
        throw new Error('An availability slot already exists for this date and time.');
      }

      const newSlot = {
        id: `slot_${Date.now()}`,
        mentorId,
        date,
        startTime,
        endTime,
        status: 'available',
        subject: subject || 'General Mentorship'
      };

      slots.push(newSlot);
      storage.setAvailability(slots);
      return newSlot;
    } else {
      const response = await apiClient.post('/availability', { date, startTime, endTime, subject });
      return response.data.data;
    }
  },

  deleteSlot: async (slotId, mentorId) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const slots = storage.getAvailability();
      const idx = slots.findIndex(s => s.id === slotId);

      if (idx === -1) {
        throw new Error('Availability slot not found.');
      }

      const slot = slots[idx];
      if (slot.mentorId !== mentorId) {
        throw new Error('Unauthorized.');
      }

      if (slot.status === 'booked') {
        throw new Error('Cannot delete because this session is already booked.');
      }

      slots.splice(idx, 1);
      storage.setAvailability(slots);
      return true;
    } else {
      const response = await apiClient.delete(`/availability/${slotId}`);
      return response.data.success;
    }
  }
};
