const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const app = require('./app');
const env = require('./config/env');

const server = http.createServer(app);

// Initialize PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/'
});
peerServer.on('connection', (client) => {
  console.log(`[PeerServer] Client connected: ${client.getId()}`);
});
peerServer.on('disconnect', (client) => {
  console.log(`[PeerServer] Client disconnected: ${client.getId()}`);
});
app.use('/peerjs', peerServer);

// Initialize Socket.io signaling server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Track which room each socket belongs to and active participants per room
const socketRoomMap = {};
const roomParticipants = {}; // { [roomId]: [ { socketId, userId, userName, peerId } ] }

// WebRTC Socket.io signaling coordination
io.on('connection', (socket) => {
  console.log(`[Signaling] Peer connected: ${socket.id}`);

  // Room coordination
  socket.on('join-room', ({ bookingId, userId, userName, peerId }) => {
    socket.join(bookingId);
    socketRoomMap[socket.id] = bookingId;

    if (!roomParticipants[bookingId]) {
      roomParticipants[bookingId] = [];
    }

    // Filter out previous socket for this user if reconnecting
    roomParticipants[bookingId] = roomParticipants[bookingId].filter(
      p => p.socketId !== socket.id && p.userId !== userId
    );

    const existingUsers = [...roomParticipants[bookingId]];

    const newParticipant = { socketId: socket.id, userId, userName, peerId };
    roomParticipants[bookingId].push(newParticipant);

    console.log(`[Signaling] User ${userId} (${userName}) joined room: ${bookingId} (peerId: ${peerId}). Active users: ${roomParticipants[bookingId].length}`);

    // 1. Send the newly joined user the list of existing participants already in the room
    socket.emit('room-users', { users: existingUsers });

    // 2. Notify other participants in the room that a new user connected
    socket.to(bookingId).emit('user-connected', newParticipant);
  });

  // Relay manual call request / re-negotiation request
  socket.on('request-call', ({ bookingId, fromPeerId, toPeerId }) => {
    console.log(`[Signaling] Requesting call in ${bookingId} from ${fromPeerId} to ${toPeerId}`);
    socket.to(bookingId).emit('call-requested', { fromPeerId, toPeerId, fromSocketId: socket.id });
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

  // Relay screen sharing state changes
  socket.on('screen-share-change', ({ bookingId, isSharing }) => {
    console.log(`[Signaling] Screen share changed in room ${bookingId} (isSharing: ${isSharing})`);
    socket.to(bookingId).emit('peer-screen-share-change', {
      fromSocketId: socket.id,
      isSharing
    });
  });

  // Relay in-call chat messages
  socket.on('send-message', ({ bookingId, message, senderName, role, timestamp }) => {
    console.log(`[Signaling] Chat message in room ${bookingId} from ${senderName}`);
    socket.to(bookingId).emit('receive-message', {
      message,
      senderName,
      role,
      timestamp
    });
  });

  // Peer disconnecting or leaving room
  const handleLeave = (socketId) => {
    const roomId = socketRoomMap[socketId];
    if (roomId && roomParticipants[roomId]) {
      const leavingUser = roomParticipants[roomId].find(p => p.socketId === socketId);
      roomParticipants[roomId] = roomParticipants[roomId].filter(p => p.socketId !== socketId);
      if (roomParticipants[roomId].length === 0) {
        delete roomParticipants[roomId];
      }
      console.log(`[Signaling] Socket ${socketId} left room ${roomId}`);
      socket.to(roomId).emit('user-disconnected', {
        socketId,
        userId: leavingUser?.userId,
        peerId: leavingUser?.peerId
      });
      delete socketRoomMap[socketId];
    }
  };

  socket.on('leave-room', () => handleLeave(socket.id));
  socket.on('disconnect', () => handleLeave(socket.id));
});

const PORT = env.PORT;
server.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(`   CampusConnect Server is running on port ${PORT}`);
  console.log(`   Local API URL: http://localhost:${PORT}/api/health`);
  console.log(`=============================================================`);
});
