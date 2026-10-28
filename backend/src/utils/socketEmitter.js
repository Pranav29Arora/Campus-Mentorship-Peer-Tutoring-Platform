let ioInstance = null;

const initSocketEmitter = (io) => {
  ioInstance = io;
  console.log('[SocketEmitter] Socket.io emitter initialized.');
};

const emitBookingUpdate = (action, data = {}) => {
  if (ioInstance) {
    console.log(`[Socket] Broadcasting booking update (action: ${action})`);
    ioInstance.emit('booking_updated', {
      action,
      ...data,
      timestamp: Date.now()
    });
  }
};

const emitAvailabilityUpdate = (action, data = {}) => {
  if (ioInstance) {
    console.log(`[Socket] Broadcasting availability update (action: ${action})`);
    ioInstance.emit('availability_updated', {
      action,
      ...data,
      timestamp: Date.now()
    });
  }
};

module.exports = {
  initSocketEmitter,
  emitBookingUpdate,
  emitAvailabilityUpdate
};
