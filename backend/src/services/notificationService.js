const supabase = require('../config/supabase');

const formatNotification = (n) => ({
  id: n.id,
  userId: n.user_id,
  title: n.title,
  message: n.message,
  type: n.type,
  read: n.read,
  createdAt: n.created_at
});

const getNotificationsForUser = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch notifications from Supabase:', error);
    return [];
  }

  return (data || []).map(formatNotification);
};

const createNotification = async (userId, { title, message, type }) => {
  const newNotif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    user_id: userId,
    title,
    message,
    type: type || 'general',
    read: false,
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('notifications')
    .insert([newNotif]);

  if (error) {
    console.error('Error inserting notification to Supabase:', error);
  }

  return formatNotification(newNotif);
};

const markAsRead = async (notifId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notifId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating notification read state:', error);
    return null;
  }

  return data ? formatNotification(data) : null;
};

module.exports = {
  getNotificationsForUser,
  createNotification,
  markAsRead
};
