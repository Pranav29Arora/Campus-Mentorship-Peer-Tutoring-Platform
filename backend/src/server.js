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

const { initSocketEmitter } = require('./utils/socketEmitter');
initSocketEmitter(io);
app.set('io', io);

// Track which room each socket belongs to and active participants per room
const socketRoomMap = {};
const roomParticipants = {}; // { [roomId]: [ { socketId, userId, userName, peerId } ] }

// WebRTC Socket.io signaling coordination
io.on('connection', (socket) => {
  console.log(`[Signaling] Peer connected: ${socket.id}`);

  // Room coordination
  socket.on('join-room', (roomIdOrData, peerIdParam) => {
    let roomId, peerId, userId, userName;
    if (typeof roomIdOrData === 'object' && roomIdOrData !== null) {
      roomId = roomIdOrData.roomId || roomIdOrData.bookingId;
      peerId = roomIdOrData.peerId;
      userId = roomIdOrData.userId;
      userName = roomIdOrData.userName;
    } else {
      roomId = roomIdOrData;
      peerId = peerIdParam;
    }

    if (!roomId || !peerId) {
      console.warn(`[Signaling] Missing roomId or peerId in join-room:`, roomIdOrData, peerIdParam);
      return;
    }

    socket.join(roomId);
    socketRoomMap[socket.id] = roomId;

    if (!roomParticipants[roomId]) {
      roomParticipants[roomId] = [];
    }

    // Keep participant tracked by socketId (do NOT filter out by userId so two tabs on same user work)
    roomParticipants[roomId] = roomParticipants[roomId].filter(p => p.socketId !== socket.id);
    const newParticipant = { socketId: socket.id, userId, userName, peerId };
    roomParticipants[roomId].push(newParticipant);

    console.log(`[Signaling] Socket ${socket.id} (user: ${userId || 'guest'}, peer: ${peerId}) joined room: ${roomId}`);
    console.log(`[Signaling] Active participants in room ${roomId}: ${roomParticipants[roomId].length}`);

    // Notify all other users already in the room that a newcomer joined with their peerId
    socket.to(roomId).emit('user-connected', peerId);
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
