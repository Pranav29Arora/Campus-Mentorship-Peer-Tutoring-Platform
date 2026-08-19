export const mockNotifications = [
  {
    id: 'notif001',
    userId: 'student_demo',
    title: 'Session Booked',
    message: 'Your tutoring session with Rahul Sharma is confirmed for August 20, 2026.',
    type: 'success',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif002',
    userId: 'user001', // Rahul Sharma
    title: 'New Student Booking',
    message: 'Arjun Mehta booked your availability slot on August 20, 2026 at 10:00 AM.',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString()
  }
];
