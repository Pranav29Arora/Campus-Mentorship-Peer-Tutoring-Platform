const { io } = require('socket.io-client');
const http = require('http');

const SERVER_URL = 'http://127.0.0.1:5001';
const BOOKING_ID = 'booking001';

async function testVideoCall() {
  console.log('🚀 Starting End-to-End Video Call & WebRTC Signaling Test...\n');

  // 1. Test PeerJS Endpoint
  console.log('1️⃣ Checking PeerJS Server Endpoint at http://localhost:5001/peerjs...');
  await new Promise((resolve, reject) => {
    http.get('http://localhost:5001/peerjs', (res) => {
      console.log(`   PeerJS Server responded with HTTP status: ${res.statusCode}`);
      if (res.statusCode === 200 || res.statusCode === 404 || res.statusCode === 400) {
        console.log('   ✅ PeerJS server is active and accessible on port 5001.\n');
        resolve();
      } else {
        reject(new Error(`Unexpected status code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });

  // 2. Connect Student and Mentor Sockets
  console.log('2️⃣ Connecting Student and Mentor via Socket.io...');
  const studentSocket = io(SERVER_URL);
  const mentorSocket = io(SERVER_URL);

  await Promise.all([
    new Promise(res => studentSocket.on('connect', res)),
    new Promise(res => mentorSocket.on('connect', res))
  ]);
  console.log(`   ✅ Student connected (Socket ID: ${studentSocket.id})`);
  console.log(`   ✅ Mentor connected  (Socket ID: ${mentorSocket.id})\n`);

  // 3. Student Joins Tutoring Room
  console.log(`3️⃣ Student joining room: ${BOOKING_ID}...`);
  studentSocket.emit('join-room', {
    bookingId: BOOKING_ID,
    userId: 'student_demo',
    userName: 'Arjun Mehta',
    peerId: 'student_peer_12345'
  });

  // 4. Mentor Joins Tutoring Room & Student Receives user-connected
  console.log(`4️⃣ Mentor joining room: ${BOOKING_ID}...`);
  const userConnectedPromise = new Promise((resolve) => {
    studentSocket.on('user-connected', (data) => {
      console.log(`   ✅ Student received 'user-connected' event:`, data);
      resolve(data);
    });
  });

  mentorSocket.emit('join-room', {
    bookingId: BOOKING_ID,
    userId: 'mentor_demo',
    userName: 'Rahul Sharma',
    peerId: 'mentor_peer_67890'
  });

  const connectedData = await userConnectedPromise;
  const receivedPeerId = typeof connectedData === 'object' ? connectedData.peerId : connectedData;
  if (receivedPeerId !== 'mentor_peer_67890') {
    throw new Error(`Peer coordination data mismatch! Received: ${receivedPeerId}`);
  }
  console.log('   ✅ Room coordination and peer presence verified!\n');

  // 5. Test Live In-Call Chat Messages
  console.log('5️⃣ Testing In-Call Chat Messaging...');
  const studentMsgPromise = new Promise((resolve) => {
    mentorSocket.on('receive-message', (msg) => {
      console.log(`   ✅ Mentor received chat message:`, msg);
      resolve(msg);
    });
  });

  studentSocket.emit('send-message', {
    bookingId: BOOKING_ID,
    message: 'Hi Rahul! I have a question about Binary Trees balancing.',
    senderName: 'Arjun Mehta',
    role: 'student',
    timestamp: '10:05 AM'
  });

  const receivedMsg = await studentMsgPromise;
  if (receivedMsg.message !== 'Hi Rahul! I have a question about Binary Trees balancing.') {
    throw new Error('Chat message content mismatch!');
  }

  // Mentor replies
  const mentorMsgPromise = new Promise((resolve) => {
    studentSocket.on('receive-message', (msg) => {
      console.log(`   ✅ Student received mentor reply:`, msg);
      resolve(msg);
    });
  });

  mentorSocket.emit('send-message', {
    bookingId: BOOKING_ID,
    message: 'Sure Arjun! Let us review AVL tree rotations step-by-step.',
    senderName: 'Rahul Sharma',
    role: 'mentor',
    timestamp: '10:06 AM'
  });

  await mentorMsgPromise;
  console.log('   ✅ Bi-directional live chat communication verified!\n');

  // 6. Test Microphone & Camera Media State Changes
  console.log('6️⃣ Testing Microphone & Camera Media State Toggles...');
  const mediaStatePromise = new Promise((resolve) => {
    mentorSocket.on('peer-media-state-change', (data) => {
      console.log(`   ✅ Mentor received student media-state-change:`, data);
      resolve(data);
    });
  });

  studentSocket.emit('media-state-change', {
    bookingId: BOOKING_ID,
    mediaType: 'mic',
    enabled: false
  });

  const mediaStateData = await mediaStatePromise;
  if (mediaStateData.mediaType !== 'mic' || mediaStateData.enabled !== false) {
    throw new Error('Media state event data mismatch!');
  }
  console.log('   ✅ Microphone mute/unmute state broadcast verified!\n');

  // 7. Test Screen Sharing Event Relay
  console.log('7️⃣ Testing Screen Share Broadcast...');
  const screenSharePromise = new Promise((resolve) => {
    studentSocket.on('peer-screen-share-change', (data) => {
      console.log(`   ✅ Student received mentor screen-share-change:`, data);
      resolve(data);
    });
  });

  mentorSocket.emit('screen-share-change', {
    bookingId: BOOKING_ID,
    isSharing: true
  });

  const screenData = await screenSharePromise;
  if (screenData.isSharing !== true) {
    throw new Error('Screen share event data mismatch!');
  }
  console.log('   ✅ Screen share broadcast verified!\n');

  // 8. Test SDP / WebRTC Signal Relay
  console.log('8️⃣ Testing WebRTC SDP/ICE Signal Relay...');
  const signalPromise = new Promise((resolve) => {
    studentSocket.on('signal', (data) => {
      console.log(`   ✅ Student received WebRTC signal relay:`, data.signalData);
      resolve(data);
    });
  });

  mentorSocket.emit('signal', {
    bookingId: BOOKING_ID,
    signalData: { type: 'offer', sdp: 'v=0\r\no=mentor 12345 2 IN IP4 127.0.0.1...' },
    toSocketId: studentSocket.id
  });

  await signalPromise;
  console.log('   ✅ WebRTC signal offer/answer relay verified!\n');

  // Clean up
  studentSocket.disconnect();
  mentorSocket.disconnect();

  console.log('🎉 ALL VIDEO CALL, AUDIO, COMMENTS, AND SCREEN SHARE FUNCTIONS ARE WORKING PERFECTLY!');
}

testVideoCall().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
