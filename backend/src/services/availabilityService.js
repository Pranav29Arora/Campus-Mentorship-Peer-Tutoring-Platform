const supabase = require('../config/supabase');
const { emitAvailabilityUpdate, emitBookingUpdate } = require('../utils/socketEmitter');

const formatSlot = (s) => ({
  id: s.id,
  mentorId: s.mentor_id,
  date: s.date,
  startTime: s.start_time,
  endTime: s.end_time,
  status: s.status,
  subject: s.subject,
  createdAt: s.created_at || new Date().toISOString()
});

const getAvailableSlots = async (mentorId) => {
  let targetMentorId = mentorId;
  const { data: mentor } = await supabase
    .from('mentors')
    .select('id')
    .or(`id.eq.${mentorId},user_id.eq.${mentorId}`)
    .maybeSingle();

  if (mentor) {
    targetMentorId = mentor.id;
  }

  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('mentor_id', targetMentorId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch availability slots: ${error.message}`);
  }

  return (data || []).map(formatSlot);
};

const createSlot = async (mentorId, slotData) => {
  const { date, startTime, endTime, subject } = slotData;

  // Overlap validation
  const { data: existingSlots } = await supabase
    .from('availability')
    .select('id')
    .eq('mentor_id', mentorId)
    .eq('date', date)
    .eq('start_time', startTime)
    .maybeSingle();

  if (existingSlots) {
    throw new Error('An availability slot already exists for this date and start time.');
  }

  const newSlot = {
    id: `slot_${Date.now()}`,
    mentor_id: mentorId,
    date,
    start_time: startTime,
    end_time: endTime,
    status: 'available',
    subject: subject || 'General Mentorship'
  };

  const { error } = await supabase
    .from('availability')
    .insert([newSlot]);

  if (error) {
    throw new Error(`Failed to create availability slot: ${error.message}`);
  }

  const formatted = formatSlot(newSlot);
  emitAvailabilityUpdate('slot_created', { mentorId, slot: formatted });
  return formatted;
};

const deleteSlot = async (mentorId, slotId) => {
  // Check slot exists
  const { data: slot, error: fetchErr } = await supabase
    .from('availability')
    .select('*')
    .eq('id', slotId)
    .maybeSingle();

  if (fetchErr || !slot) {
    throw new Error('Availability slot not found.');
  }

  // Resolve target mentor ID (supports mentor profile ID and user_id)
  let targetMentorId = mentorId;
  const { data: mentor } = await supabase
    .from('mentors')
    .select('id, user_id')
    .or(`id.eq.${mentorId},user_id.eq.${mentorId}`)
    .maybeSingle();

  if (mentor) {
    targetMentorId = mentor.id;
  }

  if (slot.mentor_id !== targetMentorId) {
    throw new Error('Unauthorized. You do not own this slot.');
  }

  // If slot was booked, also remove any associated booking record
  if (slot.status === 'booked') {
    await supabase
      .from('bookings')
      .delete()
      .eq('mentor_id', targetMentorId)
      .eq('date', slot.date)
      .eq('start_time', slot.start_time);

    emitBookingUpdate('slot_deleted', { mentorId: targetMentorId, date: slot.date, startTime: slot.start_time });
  }

  const { error: deleteErr } = await supabase
    .from('availability')
    .delete()
    .eq('id', slotId);

  if (deleteErr) {
    throw new Error(`Failed to delete slot: ${deleteErr.message}`);
  }

  emitAvailabilityUpdate('slot_deleted', { mentorId: targetMentorId, slotId });

  return { success: true, message: 'Slot deleted successfully.' };
};

module.exports = {
  getAvailableSlots,
  createSlot,
  deleteSlot
};
