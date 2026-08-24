const notificationService = require('../services/notificationService');

const getNotifications = async (req, res, next) => {
  try {
    const notifs = await notificationService.getNotificationsForUser(req.user.id);
    res.status(200).json({
      success: true,
      data: notifs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.',
      error: error.message
    });
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = await notificationService.markAsRead(id);
    res.status(200).json({
      success: true,
      data: notif
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notification.',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
