const db = require('./dbStore');

const getNotificationsForUser = async (userId) => {
  return db.notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const createNotification = async (userId, { title, message, type }) => {
  const newNotif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId,
    title,
    message,
    type, // 'booking_created', 'booking_cancelled', etc.
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.push(newNotif);
  return newNotif;
};

const markAsRead = async (notifId) => {
  const notif = db.notifications.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
  }
  return notif;
};

module.exports = {
  getNotificationsForUser,
  createNotification,
  markAsRead
};
