const bookingService = require('../services/bookingService');

const getBookings = async (req, res, next) => {
  try {
    const list = await bookingService.getBookings(req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings.',
      error: error.message
    });
  }
};

const createBooking = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students are authorized to book tutoring sessions.'
      });
    }

    const { mentorId, slotId } = req.body;
    if (!mentorId || !slotId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both mentorId and slotId.'
      });
    }

    const booking = await bookingService.createBooking(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Session booked successfully.',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to book slot.'
    });
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status update value.'
      });
    }

    const booking = await bookingService.updateBookingStatus(
      req.user.id,
      req.user.role,
      id,
      { status }
    );

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update booking.'
    });
  }
};

module.exports = {
  getBookings,
  createBooking,
  updateBooking
};
