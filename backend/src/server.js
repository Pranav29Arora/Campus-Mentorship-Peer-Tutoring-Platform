const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');

const server = http.createServer(app);

// Initialize Socket.io signaling server
const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// WebRTC Socket.io signaling coordination
io.on('connection', (socket) => {
  console.log(`[Signaling] Peer connected: ${socket.id}`);

  // Room coordination
  socket.on('join-room', ({ bookingId, userId, userName }) => {
    socket.join(bookingId);
    console.log(`[Signaling] User ${userId} (${userName}) joined room: ${bookingId}`);
    
    // Notify other participants in the room
    socket.to(bookingId).emit('user-connected', { userId, userName, socketId: socket.id });
  });

  // Relay WebRTC SDP offer, answer, or ICE candidate
  socket.on('signal', ({ bookingId, signalData, toSocketId }) => {
    console.log(`[Signaling] Relaying signal from ${socket.id} to room ${bookingId}`);
    if (toSocketId) {
      io.to(toSocketId).emit('signal', {
        signalData,
        fromSocketId: socket.id
      });
    } else {
      socket.to(bookingId).emit('signal', {
        signalData,
        fromSocketId: socket.id
      });
    }
  });

  // Relay microphone or camera mute/toggle changes
  socket.on('media-state-change', ({ bookingId, mediaType, enabled }) => {
    console.log(`[Signaling] Media state changed in room ${bookingId} (${mediaType}: ${enabled})`);
    socket.to(bookingId).emit('peer-media-state-change', {
      fromSocketId: socket.id,
      mediaType,
      enabled
    });
  });

  // Peer disconnecting
  socket.on('disconnect', () => {
    console.log(`[Signaling] Peer disconnected: ${socket.id}`);
    io.emit('user-disconnected', { socketId: socket.id });
  });
});

const PORT = env.PORT;
server.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(`   CampusConnect Server is running on port ${PORT}`);
  console.log(`   Local API URL: http://localhost:${PORT}/api/health`);
  console.log(`=============================================================`);
});
