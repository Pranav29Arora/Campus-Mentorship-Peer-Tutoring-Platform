const db = require('./dbStore');

const getAvailableSlots = async (mentorId) => {
  return db.availability.filter(slot => slot.mentorId === mentorId);
};

const createSlot = async (mentorId, slotData) => {
  const { date, startTime, endTime, subject } = slotData;

  // Overlap validation
  const duplicate = db.availability.find(slot => 
    slot.mentorId === mentorId &&
    slot.date === date &&
    slot.startTime === startTime
  );

  if (duplicate) {
    throw new Error('An availability slot already exists for this date and start time.');
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

  db.availability.push(newSlot);
  return newSlot;
};

const deleteSlot = async (mentorId, slotId) => {
  const slotIndex = db.availability.findIndex(slot => slot.id === slotId);
  if (slotIndex === -1) {
    throw new Error('Availability slot not found.');
  }

  const slot = db.availability[slotIndex];
  if (slot.mentorId !== mentorId) {
    throw new Error('Unauthorized. You do not own this slot.');
  }

  if (slot.status === 'booked') {
    throw new Error('Cannot delete this slot because it has already been booked by a student.');
  }

  db.availability.splice(slotIndex, 1);
  return { success: true, message: 'Slot deleted successfully.' };
};

module.exports = {
  getAvailableSlots,
  createSlot,
  deleteSlot
};
