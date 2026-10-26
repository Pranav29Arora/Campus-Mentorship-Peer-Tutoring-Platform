const availabilityService = require('../services/availabilityService');
const supabase = require('../config/supabase');

const getSlots = async (req, res, next) => {
  try {
    const { mentorId } = req.params;
    const slots = await availabilityService.getAvailableSlots(mentorId);
    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slots.',
      error: error.message
    });
  }
};

const createSlot = async (req, res, next) => {
  try {
    // Resolve mentor profile from user credentials in Supabase
    const { data: mentor, error: mentorErr } = await supabase
      .from('mentors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (mentorErr || !mentor) {
      return res.status(403).json({
        success: false,
        message: 'Only registered mentors can create availability slots.'
      });
    }

    const { date, startTime, endTime, subject } = req.body;
    if (!date || !startTime || !endTime || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all details: date, startTime, endTime, and subject.'
      });
    }

    const slot = await availabilityService.createSlot(mentor.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Availability slot created successfully.',
      data: slot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create slot.'
    });
  }
};

const deleteSlot = async (req, res, next) => {
  try {
    const { data: mentor, error: mentorErr } = await supabase
      .from('mentors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (mentorErr || !mentor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized action.'
      });
    }

    const { id } = req.params;
    const result = await availabilityService.deleteSlot(mentor.id, id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete slot.'
    });
  }
};

module.exports = {
  getSlots,
  createSlot,
  deleteSlot
};
