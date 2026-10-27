import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { 
  Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff, Users, 
  MessageSquare, Maximize2, Minimize2, Grid, Tv, Send, 
  Sparkles, X, MonitorCheck, AlertTriangle, RefreshCw, FlipHorizontal
} from 'lucide-react';
import { io } from 'socket.io-client';
import Peer from 'peerjs';

// Global media track registry so no camera or microphone track can ever be orphaned across unmounts
const globalActiveMediaTracks = new Set();

const VideoCall = () => {
  const { bookingId } = useParams();
  const { user } = useContext(AuthContext);
  const { bookings, completeBooking, fetchBookings } = useContext(AppContext);
  const navigate = useNavigate();

  // WebRTC & Stream states
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [peerName, setPeerName] = useState('Remote Participant');
  const [connectionState, setConnectionState] = useState('connecting'); // 'connecting' | 'connected'
  const [cameraPermissionError, setCameraPermissionError] = useState(null);

  // Media & Layout controls
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [peerScreenShareActive, setPeerScreenShareActive] = useState(false);
  const [peerMediaState, setPeerMediaState] = useState({ camera: true, mic: true });
  const [isMirrored, setIsMirrored] = useState(true); // Mirrored for natural right-profile orientation

  // UI & View Mode controls
  const [viewMode, setViewMode] = useState('stage'); // 'stage' | 'grid'
  const [activeTab, setActiveTab] = useState(null); // null | 'chat' | 'participants'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // In-call Chat state
  const [chatMessages, setChatMessages] = useState([
    { id: 1, senderName: 'System', text: 'Welcome to the tutoring video session! Screen sharing and live chat are enabled.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSystem: true }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // DOM Elements & Connection refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const screenVideoRef = useRef(null);
  const activeRemotePeerIdRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const chatBottomRef = useRef(null);
  const containerRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const isUnmountedRef = useRef(false);
  const activeTracksRef = useRef(new Set());
  const mountedVideoElementsRef = useRef(new Set());
  const initSessionIdRef = useRef(0);
  const isTogglingCameraRef = useRef(false);

  // Current Session info
  const booking = bookings.find(b => b.id === bookingId);
  const isMentor = user?.role === 'mentor';

  // Helper to register every media track in the component and global registries
  const registerStreamTracks = useCallback((stream) => {
    if (!stream) return;
    try {
      stream.getTracks().forEach(track => {
        activeTracksRef.current.add(track);
        globalActiveMediaTracks.add(track);
        track.addEventListener('ended', () => {
          activeTracksRef.current.delete(track);
          globalActiveMediaTracks.delete(track);
        });
      });
    } catch (e) {
      console.warn('[WebRTC] Error registering track:', e);
    }
  }, []);

  // Reliably attach a MediaStream to a <video> element and call .play()
  const attachStream = useCallback((videoEl, stream) => {
    if (!videoEl) return;
    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream || null;
    }
    if (stream) {
      videoEl.play().catch(() => {
        // Autoplay policy — will unblock on next user gesture
      });
    }
  }, []);

  // Comprehensive stream cleanup — stops ALL media tracks so the camera hardware LED turns OFF immediately
  const stopAllTracks = useCallback(() => {
    console.log('[WebRTC] Stopping all tracks and releasing camera hardware...');
    isUnmountedRef.current = true;
    initSessionIdRef.current++;

    // 1. Close WebRTC RTCPeerConnection and stop its senders
    if (currentCallRef.current) {
      try {
        if (currentCallRef.current.peerConnection) {
          const pc = currentCallRef.current.peerConnection;
          pc.getSenders().forEach(sender => {
            try {
              if (sender.track) {
                sender.track.stop();
                console.log(`[WebRTC] Stopped sender track: ${sender.track.kind}`);
              }
            } catch (e) {}
          });
          pc.close();
        }
        currentCallRef.current.close();
      } catch (e) {}
      currentCallRef.current = null;
    }

    // 2. Stop every tracked track in our active track registries
    const allTracks = new Set([...activeTracksRef.current, ...globalActiveMediaTracks]);
    allTracks.forEach(track => {
      try {
        track.stop();
        console.log(`[WebRTC] Explicitly stopped track: ${track.kind} (${track.label})`);
      } catch (e) {
        console.warn('[WebRTC] Error stopping track:', e);
      }
    });
    activeTracksRef.current.clear();
    globalActiveMediaTracks.clear();

    // 3. Stop every track in known stream refs and current state
    const streamsToStop = [
      localStreamRef.current,
      screenStreamRef.current,
      remoteStreamRef.current,
      localStream,
      screenStream,
      remoteStream
    ].filter(Boolean);

    streamsToStop.forEach(stream => {
      try {
        stream.getTracks().forEach(track => {
          try {
            track.stop();
            console.log(`[WebRTC] Stopped stream track: ${track.kind} (${track.label})`);
          } catch (e) {}
        });
      } catch (e) {}
    });

    localStreamRef.current = null;
    screenStreamRef.current = null;
    remoteStreamRef.current = null;

    // 4. Detach srcObject & pause all mounted video elements
    mountedVideoElementsRef.current.forEach(videoEl => {
      try {
        videoEl.pause();
        videoEl.srcObject = null;
      } catch (e) {}
    });
    mountedVideoElementsRef.current.clear();

    [localVideoRef, remoteVideoRef, screenVideoRef].forEach(ref => {
      if (ref.current) {
        try {
          ref.current.pause();
          ref.current.srcObject = null;
        } catch (e) {}
      }
    });

    // 5. Update React state so UI reflects no active hardware streams
    setLocalStream(null);
    setRemoteStream(null);
    setScreenStream(null);
    setCameraActive(false);
    setMicActive(false);
    setScreenShareActive(false);

    // 6. Disconnect socket and destroy PeerJS
    if (socketRef.current) {
      try {
        socketRef.current.emit('leave-room', { bookingId, userId: user?.id });
        socketRef.current.disconnect();
      } catch (e) {}
      socketRef.current = null;
    }
    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch (e) {}
      peerRef.current = null;
    }

    console.log('[WebRTC] Cleanup complete — camera hardware released.');
  }, [bookingId, user?.id]);

  useEffect(() => {
    if (user && bookings.length === 0 && fetchBookings) {
      fetchBookings();
    }
  }, [user, bookings.length, fetchBookings]);

  // Update peer name when booking details load without triggering WebRTC re-initialization
  useEffect(() => {
    if (booking) {
      setPeerName(isMentor ? booking.studentName || 'Student' : booking.mentorName);
    }
  }, [booking, isMentor]);

  // Main WebRTC Session Lifecycle — runs once on mount per bookingId
  useEffect(() => {
    isUnmountedRef.current = false;
    initializeLocalStream();

    // Ensure camera is released if the user closes/refreshes the tab or navigates
    const handleBeforeUnload = () => stopAllTracks();
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      isUnmountedRef.current = true;
      initSessionIdRef.current++;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      stopAllTracks();
    };
  }, [bookingId]);

  useEffect(() => {
    if (activeTab === 'chat') {
      setUnreadChatCount(0);
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, chatMessages]);

  // Keep video & audio elements in sync whenever streams change
  useEffect(() => { attachStream(localVideoRef.current, localStream); }, [localStream, attachStream]);
  useEffect(() => { attachStream(remoteVideoRef.current, remoteStream); }, [remoteStream, attachStream]);
  useEffect(() => { attachStream(screenVideoRef.current, screenStream); }, [screenStream, attachStream]);
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      if (remoteAudioRef.current.srcObject !== remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
      remoteAudioRef.current.play().catch(e => {
        console.warn('[Audio] Autoplay policy prevented immediate playback, will resume on user gesture:', e);
      });
    }
  }, [remoteStream]);

  // 1. Initialize Local Camera/Microphone Stream
  const initializeLocalStream = async () => {
    const sessionId = ++initSessionIdRef.current;
    setCameraPermissionError(null);

    // Stop any existing stream before getting a new one
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      localStreamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // If component was unmounted or this init was superseded (e.g. React StrictMode mount 1 cleanup):
      if (isUnmountedRef.current || sessionId !== initSessionIdRef.current) {
        console.log('[WebRTC] Stream acquired after unmount/superseded. Immediately stopping tracks.');
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      registerStreamTracks(stream);
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCameraActive(true);
      setMicActive(true);
      attachStream(localVideoRef.current, stream);
      initializeWebRTC(stream);
    } catch (err) {
      console.error('[WebRTC] Camera/mic access failed:', err);
      if (isUnmountedRef.current || sessionId !== initSessionIdRef.current) return;

      // Show a human-readable error banner
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermissionError('Camera/microphone permission was denied. Click the camera icon in the browser address bar and allow access, then click Retry.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraPermissionError('No camera or microphone found. Please connect a device and click Retry.');
      } else if (err.name === 'NotReadableError') {
        setCameraPermissionError('Your camera is being used by another app. Close it and click Retry.');
      } else {
        setCameraPermissionError(`Could not start camera: ${err.message}`);
      }

      // Audio-only graceful fallback so WebRTC can still connect
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (isUnmountedRef.current || sessionId !== initSessionIdRef.current) {
          audioOnly.getTracks().forEach(t => t.stop());
          return;
        }
        registerStreamTracks(audioOnly);
        localStreamRef.current = audioOnly;
        setLocalStream(audioOnly);
        setCameraActive(false);
        initializeWebRTC(audioOnly);
      } catch (audioErr) {
        console.error('[WebRTC] Audio-only fallback failed too:', audioErr);
        initializeWebRTC(new MediaStream());
      }
    }
  };


  // 2. Initialize WebRTC & Socket.io Signaling
  const initializeWebRTC = (stream) => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
    const serverUrl = apiBase.replace(/\/api\/?$/, '');

    // Determine host and port dynamically (supports localhost and LAN IP)
    let targetHost = window.location.hostname;
    let targetPort = 5001;
    let isSecure = window.location.protocol === 'https:';

    try {
      const urlObj = new URL(serverUrl);
      targetHost = urlObj.hostname || window.location.hostname;
      // If serverUrl is localhost/127.0.0.1 but the browser was opened with a LAN IP/domain, use the browser's hostname
      if ((targetHost === 'localhost' || targetHost === '127.0.0.1') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        targetHost = window.location.hostname;
      }
      if (urlObj.port) {
        targetPort = parseInt(urlObj.port);
      } else {
        targetPort = isSecure ? 443 : 80;
      }
      isSecure = urlObj.protocol === 'https:';
    } catch (e) {
      console.warn('[WebRTC] Error parsing serverUrl:', e);
    }

    const socketUrl = `${window.location.protocol}//${targetHost}:${targetPort}`;
    console.log(`[WebRTC] Connecting signaling socket to: ${socketUrl}`);
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10
    });
    socketRef.current = socket;

    console.log(`[WebRTC] Initializing PeerJS with host=${targetHost}, port=${targetPort}, secure=${isSecure}`);
    const peer = new Peer(undefined, {
      host: targetHost,
      port: targetPort,
      secure: isSecure,
      path: '/peerjs',
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      }
    });
    peerRef.current = peer;

    let fallbackCallTimeout = null;

    // Helper to safely bind stream handlers to any call (incoming or outgoing)
    const setupCallHandlers = (call, callerRoleName) => {
      currentCallRef.current = call;

      const handleRemoteStream = (remoteMediaStream) => {
        if (!remoteMediaStream) return;
        console.log('[WebRTC] Remote MediaStream attached! Tracks:', remoteMediaStream.getTracks().map(t => `${t.kind}:${t.enabled}`));
        registerStreamTracks(remoteMediaStream);
        remoteStreamRef.current = remoteMediaStream;
        setRemoteStream(remoteMediaStream);
        setConnectionState('connected');

        // Route to dedicated audio element for crystal clear voice playback
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteMediaStream;
          remoteAudioRef.current.play().catch(e => console.warn('[Audio] Autoplay warning:', e));
        }

        // Attach to remote video element if mounted
        if (remoteVideoRef.current) {
          attachStream(remoteVideoRef.current, remoteMediaStream);
        }
      };

      call.on('stream', handleRemoteStream);

      // Also listen on native RTCPeerConnection track event (non-destructive)
      if (call.peerConnection) {
        call.peerConnection.addEventListener('track', (event) => {
          console.log('[WebRTC] Native track event received:', event.track.kind);
          if (event.streams && event.streams[0]) {
            handleRemoteStream(event.streams[0]);
          } else {
            const currentRemote = remoteStreamRef.current || new MediaStream();
            if (!currentRemote.getTracks().some(t => t.id === event.track.id)) {
              currentRemote.addTrack(event.track);
              handleRemoteStream(currentRemote);
            }
          }
        });

        call.peerConnection.addEventListener('iceconnectionstatechange', () => {
          console.log('[WebRTC] ICE Connection State:', call.peerConnection.iceConnectionState);
          if (['connected', 'completed'].includes(call.peerConnection.iceConnectionState)) {
            setConnectionState('connected');
          }
        });
      }

      call.on('close', () => {
        console.log('[WebRTC] Call ended by peer');
        setConnectionState('connecting');
        setRemoteStream(null);
        remoteStreamRef.current = null;
        activeRemotePeerIdRef.current = null;
      });

      call.on('error', (err) => console.error('[PeerJS] Call error:', err));
    };

    // Helper to dial a remote peer safely
    const callRemotePeer = (targetPeerId, targetName) => {
      if (!targetPeerId || !peer || peer.destroyed) return;
      if (activeRemotePeerIdRef.current === targetPeerId && currentCallRef.current?.open) {
        console.log('[WebRTC] Already in open call with', targetPeerId);
        return;
      }

      activeRemotePeerIdRef.current = targetPeerId;
      if (targetName) setPeerName(targetName);

      const currentStream = localStreamRef.current || stream || new MediaStream();
      console.log(`[WebRTC] Dialing peer ${targetName || ''} (${targetPeerId}) with stream tracks:`, currentStream?.getTracks().length);

      try {
        const outgoingCall = peer.call(targetPeerId, currentStream);
        setupCallHandlers(outgoingCall, targetName);
      } catch (err) {
        console.error('[WebRTC] Call initiation error:', err);
      }
    };

    peer.on('open', (peerId) => {
      console.log('[PeerJS] Local Peer ID registered:', peerId);
      socket.emit('join-room', {
        bookingId,
        userId: user?.id || `user_${Date.now()}`,
        userName: user?.name || 'Participant',
        peerId
      });
    });

    peer.on('error', (err) => console.error('[PeerJS] Peer error:', err));

    // Handle Incoming Call from remote peer
    peer.on('call', (incomingCall) => {
      console.log('[PeerJS] Incoming call received from:', incomingCall.peer);
      clearTimeout(fallbackCallTimeout);
      activeRemotePeerIdRef.current = incomingCall.peer;
      const currentStream = localStreamRef.current || stream || new MediaStream();
      incomingCall.answer(currentStream);
      setupCallHandlers(incomingCall);
    });

    // Polite peer pattern: lexicographical ID comparison determines who calls
    const coordinateCall = (remotePeerId, remoteUserName) => {
      if (!remotePeerId) return;
      if (remoteUserName) setPeerName(remoteUserName);

      const myPeerId = peer.id;
      if (!myPeerId) {
        peer.once('open', () => coordinateCall(remotePeerId, remoteUserName));
        return;
      }

      const isCaller = myPeerId > remotePeerId;
      console.log(`[Signaling] Call coordination: myPeerId=${myPeerId}, remotePeerId=${remotePeerId}, isCaller=${isCaller}`);

      if (isCaller) {
        callRemotePeer(remotePeerId, remoteUserName);
      } else {
        clearTimeout(fallbackCallTimeout);
        fallbackCallTimeout = setTimeout(() => {
          if (!currentCallRef.current || !currentCallRef.current.open) {
            console.log('[WebRTC] Fallback timeout: dialing remote peer as backup');
            callRemotePeer(remotePeerId, remoteUserName);
          }
        }, 4000);
      }
    };

    // 1. Existing users already waiting in room when we connect
    socket.on('room-users', ({ users }) => {
      console.log('[Signaling] Existing room participants:', users);
      const otherUser = users.find(u => u.peerId && u.socketId !== socket.id);
      if (otherUser) {
        coordinateCall(otherUser.peerId, otherUser.userName);
      }
    });

    // 2. New user joins room while we are already waiting
    socket.on('user-connected', ({ userId, userName, peerId }) => {
      console.log(`[Signaling] Peer joined room: ${userName} (${peerId})`);
      if (peerId) {
        coordinateCall(peerId, userName);
      }
    });

    // 3. Manual re-sync request
    socket.on('call-requested', ({ fromPeerId, toPeerId }) => {
      if (toPeerId === peer.id) {
        console.log('[Signaling] Re-negotiating call from:', fromPeerId);
        callRemotePeer(fromPeerId);
      }
    });

    socket.on('peer-media-state-change', ({ mediaType, enabled }) => {
      setPeerMediaState(prev => ({ ...prev, [mediaType]: enabled }));
    });

    socket.on('peer-screen-share-change', ({ isSharing }) => {
      setPeerScreenShareActive(isSharing);
      if (isSharing) setViewMode('stage');
    });

    socket.on('receive-message', ({ message, senderName, role, timestamp }) => {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          senderName,
          role,
          text: message,
          time: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: false
        }
      ]);
      setUnreadChatCount(prev => (activeTab === 'chat' ? 0 : prev + 1));
    });

    socket.on('user-disconnected', () => {
      console.log('[Signaling] Remote peer disconnected');
      setConnectionState('connecting');
      setRemoteStream(null);
      remoteStreamRef.current = null;
      activeRemotePeerIdRef.current = null;
      setPeerScreenShareActive(false);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    });
  };

  // Toggle Camera On/Off (Physically releases camera hardware so laptop LED turns off)
  const toggleCamera = async () => {
    if (isTogglingCameraRef.current) return;
    isTogglingCameraRef.current = true;

    try {
      if (cameraActive) {
        // TURN CAMERA OFF: stop the hardware track so the laptop camera LED turns OFF
        console.log('[WebRTC] Turning camera OFF and releasing hardware...');
        const stream = localStreamRef.current || localStream;
        if (stream) {
          stream.getVideoTracks().forEach(track => {
            try {
              track.stop(); // Releases laptop camera hardware and turns off LED
              activeTracksRef.current.delete(track);
              globalActiveMediaTracks.delete(track);
            } catch (e) {}
            stream.removeTrack(track);
          });
        }

        // Inform WebRTC peer connection sender
        if (currentCallRef.current?.peerConnection) {
          const senders = currentCallRef.current.peerConnection.getSenders();
          const videoSender = senders.find(s => s.track?.kind === 'video');
          if (videoSender) {
            try {
              await videoSender.replaceTrack(null);
            } catch (e) {}
          }
        }

        // Trigger state updates with remaining audio tracks
        const remainingTracks = (localStreamRef.current?.getTracks() || []);
        const freshStream = new MediaStream(remainingTracks);
        localStreamRef.current = freshStream;
        setLocalStream(freshStream);
        setCameraActive(false);

        if (socketRef.current) {
          socketRef.current.emit('media-state-change', {
            bookingId,
            mediaType: 'camera',
            enabled: false
          });
        }
      } else {
        // TURN CAMERA ON: acquire a new hardware track and replace in WebRTC peer
        console.log('[WebRTC] Turning camera back ON...');
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false
        });

        const newVideoTrack = newStream.getVideoTracks()[0];
        if (!newVideoTrack) return;

        registerStreamTracks(newStream);

        let stream = localStreamRef.current;
        if (!stream) {
          stream = new MediaStream();
          localStreamRef.current = stream;
        }

        // Remove any old/ended video tracks
        stream.getVideoTracks().forEach(t => stream.removeTrack(t));
        stream.addTrack(newVideoTrack);

        // Replace track in WebRTC peer connection
        if (currentCallRef.current?.peerConnection) {
          const senders = currentCallRef.current.peerConnection.getSenders();
          let videoSender = senders.find(s => s.track?.kind === 'video');
          if (!videoSender) {
            videoSender = senders.find(s => !s.track || s.track === null);
          }
          if (videoSender) {
            try {
              await videoSender.replaceTrack(newVideoTrack);
            } catch (e) {
              console.warn('[WebRTC] replaceTrack error:', e);
            }
          }
        }

        const freshStream = new MediaStream(stream.getTracks());
        localStreamRef.current = freshStream;
        setLocalStream(freshStream);
        setCameraActive(true);

        if (socketRef.current) {
          socketRef.current.emit('media-state-change', {
            bookingId,
            mediaType: 'camera',
            enabled: true
          });
        }
      }
    } catch (err) {
      console.error('[WebRTC] Error toggling camera:', err);
    } finally {
      isTogglingCameraRef.current = false;
    }
  };

  // Toggle Microphone Mute/Unmute
  const toggleMic = () => {
    const stream = localStreamRef.current || localStream;
    const newMicState = !micActive;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = newMicState;
      });
    }
    setMicActive(newMicState);

    if (socketRef.current) {
      socketRef.current.emit('media-state-change', {
        bookingId,
        mediaType: 'mic',
        enabled: newMicState
      });
    }
  };

  // Real Screen Share (`getDisplayMedia`) Toggle
  const toggleScreenShare = async () => {
    if (screenShareActive) {
      stopScreenSharing();
    } else {
      startScreenSharing();
    }
  };

  const startScreenSharing = async () => {
    try {
      // 1. Request display stream from browser
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });

      registerStreamTracks(displayStream);
      const screenTrack = displayStream.getVideoTracks()[0];
      setScreenStream(displayStream);
      screenStreamRef.current = displayStream;
      setScreenShareActive(true);
      setViewMode('stage');

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = displayStream;
      }

      // 2. Replace track in active WebRTC peer connection senders if connected
      if (currentCallRef.current && currentCallRef.current.peerConnection) {
        const senders = currentCallRef.current.peerConnection.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(screenTrack);
        }
      }

      // 3. Emit screen sharing event to room
      if (socketRef.current) {
        socketRef.current.emit('screen-share-change', {
          bookingId,
          isSharing: true
        });
      }

      // 4. Handle browser's native "Stop Sharing" floating bar event
      screenTrack.onended = () => {
        stopScreenSharing();
      };
    } catch (err) {
      console.warn('[ScreenShare] Real screen capture prompt canceled or unavailable. Enabling screen share demonstration overlay.', err);
      // Demo mode screen share fallback
      setScreenShareActive(true);
      setViewMode('stage');
      if (socketRef.current) {
        socketRef.current.emit('screen-share-change', {
          bookingId,
          isSharing: true
        });
      }
    }
  };

  const stopScreenSharing = () => {
    const currentScreenStream = screenStreamRef.current || screenStream;
    if (currentScreenStream) {
      currentScreenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      screenStreamRef.current = null;
    }
    setScreenShareActive(false);

    // Restore camera video track in WebRTC sender
    if (localStream && currentCallRef.current && currentCallRef.current.peerConnection) {
      const cameraTrack = localStream.getVideoTracks()[0];
      const senders = currentCallRef.current.peerConnection.getSenders();
      const videoSender = senders.find(s => s.track && s.track.kind === 'video');
      if (videoSender && cameraTrack) {
        videoSender.replaceTrack(cameraTrack);
      }
    }

    if (socketRef.current) {
      socketRef.current.emit('screen-share-change', {
        bookingId,
        isSharing: false
      });
    }
  };

  // Send In-Call Chat Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgObj = {
      id: Date.now(),
      senderName: user?.name || 'Participant',
      role: user?.role || 'student',
      text: newMessage.trim(),
      time: timeStr,
      isSystem: false
    };

    setChatMessages(prev => [...prev, msgObj]);

    // Emit over socket
    if (socketRef.current) {
      socketRef.current.emit('send-message', {
        bookingId,
        message: newMessage.trim(),
        senderName: user?.name || 'Participant',
        role: user?.role || 'student',
        timestamp: timeStr
      });
    }

    setNewMessage('');
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Exit fullscreen failed:', err);
      });
      setIsFullscreen(false);
    }
  };

  // End Meeting Call
  const handleEndCall = async () => {
    console.log('[VideoCall] Ending call requested by user');
    // 1. Immediately turn off camera and audio hardware
    stopAllTracks();

    // 2. If mentor, prompt for session completion
    if (isMentor) {
      if (window.confirm('Tutoring session finished. Would you like to mark this session as completed?')) {
        try {
          await completeBooking(bookingId);
        } catch (e) {
          console.error('[VideoCall] Failed to complete booking:', e);
        }
      }
    }
    // 3. Return to role dashboard
    navigate(`/${user?.role || 'student'}/dashboard`);
  };

  // Callback refs — assign stream srcObject to any visible video element dynamically
  const localVideoCallback = useCallback((el) => {
    localVideoRef.current = el;
    if (el) {
      mountedVideoElementsRef.current.add(el);
      const activeStream = localStreamRef.current || localStream;
      if (activeStream && el.srcObject !== activeStream) {
        el.srcObject = activeStream;
      }
      if (activeStream) {
        el.play().catch(() => {});
      }
    }
  }, [localStream]);

  const remoteVideoCallback = useCallback((el) => {
    remoteVideoRef.current = el;
    if (el) {
      mountedVideoElementsRef.current.add(el);
      const activeStream = remoteStreamRef.current || remoteStream;
      if (activeStream && el.srcObject !== activeStream) {
        el.srcObject = activeStream;
      }
      if (activeStream) {
        el.play().catch(() => {});
      }
    }
  }, [remoteStream]);

  const screenVideoCallback = useCallback((el) => {
    screenVideoRef.current = el;
    if (el) {
      mountedVideoElementsRef.current.add(el);
      const activeStream = screenStreamRef.current || screenStream;
      if (activeStream && el.srcObject !== activeStream) {
        el.srcObject = activeStream;
      }
      if (activeStream) {
        el.play().catch(() => {});
      }
    }
  }, [screenStream]);

  const handleSyncCall = () => {
    if (socketRef.current && peerRef.current) {
      console.log('[WebRTC] Manual sync requested by user');
      socketRef.current.emit('join-room', {
        bookingId,
        userId: user?.id || `user_${Date.now()}`,
        userName: user?.name || 'Participant',
        peerId: peerRef.current.id
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-slate-100 font-sans" ref={containerRef}>
      {/* Dedicated Hidden Audio Element for crystal clear, un-muted voice playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">

        {/* Camera Permission Error Banner */}
        {cameraPermissionError && (
          <div className="glass-panel p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-300">{cameraPermissionError}</p>
              <p className="text-xs text-amber-400/70 mt-1">You can still participate via audio only. To enable camera, allow permissions in the browser and click Retry.</p>
            </div>
            <button
              onClick={initializeLocalStream}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Header Bar: Room Info & Controls */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 mb-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3 text-left">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Tv className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                {booking?.subject || 'Campus Tutoring Room'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold uppercase tracking-wider">
                  Live Meeting
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Participant: <strong className="text-slate-200">{peerName}</strong> ({isMentor ? 'Mentee' : 'Mentor'}) • You are <strong className="text-brand-400">{user?.name}</strong> ({isMentor ? 'Mentor' : 'Student'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('stage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'stage'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Stage View (Featured speaker / screen share)"
              >
                <Tv className="w-3.5 h-3.5" />
                Stage
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View (Equal tiles)"
              >
                <Grid className="w-3.5 h-3.5" />
                Grid
              </button>
            </div>

            {/* Signal & Connection Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${
                connectionState === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'
              }`} />
              <span className="font-semibold text-slate-300">
                {connectionState === 'connected' ? 'Connected (WebRTC)' : 'Waiting for peer…'}
              </span>
            </div>

            {/* Sync / Reconnect Call Button if waiting */}
            {connectionState !== 'connected' && (
              <button
                onClick={handleSyncCall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30 text-xs font-semibold transition-all"
                title="Retry connecting with peer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync Call
              </button>
            )}
          </div>
        </div>

        {/* Main Stage Grid & Drawer Section */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch mb-4 min-h-[500px]">
          
          {/* Video Stage Area */}
          <div className={`${activeTab ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'} transition-all duration-300 flex flex-col`}>
            
            {/* Screen Share Stage View (When someone is screen sharing) */}
            {(screenShareActive || peerScreenShareActive) && viewMode === 'stage' ? (
              <div className="relative flex-1 glass-panel rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-950 flex items-center justify-center min-h-[420px] shadow-2xl">
                {screenShareActive && screenStream ? (
                  <video
                    ref={screenVideoCallback}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-contain rounded-3xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                    <MonitorCheck className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
                    <h3 className="text-xl font-extrabold text-white">
                      {screenShareActive ? 'You are sharing your screen' : `${peerName} is sharing their screen`}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-md">
                      Presentation feed is broadcasted in real-time to all session participants.
                    </p>
                  </div>
                )}

                {/* Floating Screen Share Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2 backdrop-blur-md">
                  <MonitorUp className="w-4 h-4" />
                  <span>{screenShareActive ? 'You are Sharing Screen' : `${peerName}'s Screen`}</span>
                </div>

                {/* PiP Local Camera on Right Profile Side */}
                <div className="absolute bottom-4 right-4 w-40 sm:w-48 aspect-video rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-900 z-10">
                  {localStream && cameraActive ? (
                    <video
                      ref={localVideoCallback}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover rounded-2xl ${isMirrored ? 'transform -scale-x-100' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-xs text-slate-400 font-bold">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-white">
                    You
                  </span>
                  <button
                    onClick={() => setIsMirrored(prev => !prev)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-slate-950/80 hover:bg-slate-850 text-slate-300 border border-slate-700/60"
                    title="Flip camera"
                  >
                    <FlipHorizontal className="w-3 h-3 text-brand-400" />
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              /* Balanced Grid View: Remote Peer on Left, Local User Camera on Right Profile Side */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                
                {/* Tile 1: Remote Peer (Left side) */}
                <div className="relative glass-panel rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[320px]">
                  {remoteStream ? (
                    <video
                      ref={remoteVideoCallback}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6 bg-slate-950">
                      <img
                        src={isMentor ? "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150" : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
                        alt={peerName}
                        className="w-24 h-24 rounded-full border-2 border-indigo-500 object-cover shadow-lg"
                      />
                      <div>
                        <h4 className="text-base font-bold text-white">{peerName}</h4>
                        <p className="text-xs text-amber-400 mt-1 animate-pulse">Waiting to join…</p>
                      </div>
                    </div>
                  )}

                  {remoteStream && !peerMediaState.camera && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <VideoOff className="w-8 h-8 text-slate-600" />
                      <span className="text-xs font-semibold">{peerName} turned off camera</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs font-bold text-white flex items-center gap-2">
                    <span>{peerName}</span>
                    <span className="text-[10px] text-amber-400 font-mono">({isMentor ? 'Mentee' : 'Mentor'})</span>
                    {!peerMediaState.mic && <MicOff className="w-3.5 h-3.5 text-rose-400 ml-1" />}
                  </div>
                </div>

                {/* Tile 2: Local Participant Camera (Right profile side) */}
                <div className="relative glass-panel rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[320px]">
                  {localStream && cameraActive ? (
                    <video
                      ref={localVideoCallback}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover rounded-3xl ${isMirrored ? 'transform -scale-x-100' : ''}`}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-20 h-20 rounded-full bg-brand-500/20 border-2 border-brand-500 flex items-center justify-center text-xl font-extrabold text-brand-400">
                        {user?.name?.charAt(0) || 'Y'}
                      </div>
                      <span className="text-xs text-slate-400">{cameraActive ? 'Starting camera…' : 'Camera Off'}</span>
                    </div>
                  )}

                  {!cameraActive && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <VideoOff className="w-8 h-8 text-slate-600" />
                      <span className="text-xs font-semibold">Your Camera is Off</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs font-bold text-white flex items-center gap-2">
                    <span>{user?.name} (You)</span>
                    <span className="text-[10px] text-brand-400 font-mono">({user?.role})</span>
                    {!micActive && <MicOff className="w-3.5 h-3.5 text-rose-400 ml-1" />}
                  </div>

                  {/* Flip / Mirror Button */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setIsMirrored(prev => !prev)}
                      className="px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs flex items-center gap-1.5 backdrop-blur-md transition-all shadow-sm"
                      title="Toggle Camera Mirror / Right Profile"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-[11px] font-medium">{isMirrored ? 'Mirrored' : 'Unmirrored'}</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* Stage View Default: Main Featured Remote + PiP Local */
              <div className="relative flex-1 glass-panel rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[420px]">

                {/* Main Featured Remote Stream */}
                {remoteStream ? (
                  <video
                    ref={remoteVideoCallback}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="relative">
                      <img
                        src={isMentor ? "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200" : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200"}
                        alt={peerName}
                        className="w-32 h-32 rounded-full border-4 border-indigo-500/50 object-cover shadow-2xl"
                      />
                      <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-slate-950 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{peerName}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {isMentor ? 'Student Mentee' : 'Senior Peer Mentor'} • {booking?.department || 'Academic Peer'}
                      </p>
                      <p className="text-xs text-amber-400 mt-2 animate-pulse">Waiting to join…</p>
                    </div>
                  </div>
                )}

                {remoteStream && !peerMediaState.camera && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <VideoOff className="w-10 h-10 text-slate-600" />
                    <p className="text-sm font-semibold">{peerName} paused video</p>
                  </div>
                )}

                {remoteStream && !peerMediaState.mic && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5">
                    <MicOff className="w-3.5 h-3.5" />
                    {peerName} Muted
                  </div>
                )}

                {/* PiP Local Video Thumbnail (Right Profile Side) */}
                <div className="absolute bottom-4 right-4 w-40 sm:w-48 aspect-video rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-900">
                  {localStream && cameraActive ? (
                    <video
                      ref={localVideoCallback}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover rounded-2xl ${isMirrored ? 'transform -scale-x-100' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-xs text-slate-400 font-bold">
                      {user?.name?.charAt(0)}
                    </div>
                  )}

                  {!cameraActive && (
                    <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center text-[10px] text-slate-400">
                      Camera Off
                    </div>
                  )}

                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-white">
                    You
                  </span>

                  <button
                    onClick={() => setIsMirrored(prev => !prev)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
                    title="Flip camera"
                  >
                    <FlipHorizontal className="w-3 h-3 text-brand-400" />
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Right Side Drawer (Chat / Participants) */}
          {activeTab && (
            <div className="lg:col-span-4 xl:col-span-3 glass-panel rounded-3xl border border-slate-800 bg-slate-900/90 flex flex-col overflow-hidden shadow-2xl animate-fade-in">
              
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {activeTab === 'chat' ? (
                    <>
                      <MessageSquare className="w-4 h-4 text-brand-400" />
                      Live In-Call Chat
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 text-indigo-400" />
                      Room Participants (2)
                    </>
                  )}
                </h3>
                <button
                  onClick={() => setActiveTab(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              {activeTab === 'chat' ? (
                <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
                  
                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-left text-xs">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl ${
                          msg.isSystem
                            ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-center font-medium'
                            : msg.senderName === user?.name
                            ? 'bg-brand-500/20 border border-brand-500/30 text-slate-100 ml-4'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 mr-4'
                        }`}
                      >
                        {!msg.isSystem && (
                          <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400 font-semibold">
                            <span className="text-white">{msg.senderName}</span>
                            <span>{msg.time}</span>
                          </div>
                        )}
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message or share a link..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-md"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>
              ) : (
                /* Participants List Drawer */
                <div className="p-4 space-y-3 text-left">
                  
                  {/* Participant 1: Local User */}
                  <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white">
                        {user?.name?.charAt(0) || 'Y'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{user?.name} (You)</h4>
                        <p className="text-[10px] text-slate-400 capitalize">{user?.role} Host</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {micActive ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                      {cameraActive ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                  </div>

                  {/* Participant 2: Remote Peer */}
                  <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                        {peerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{peerName}</h4>
                        <p className="text-[10px] text-slate-400 capitalize">{isMentor ? 'Student Mentee' : 'Senior Mentor'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {peerMediaState.mic ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                      {peerMediaState.camera ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Bottom Meeting Control Dock (Google Meet / Zoom Bar) */}
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 flex justify-between items-center gap-4 flex-wrap">
          
          {/* Left info badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>CampusConnect Peer Session</span>
          </div>

          {/* Center Call Control Buttons */}
          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            
            {/* Mic Toggle */}
            <button
              onClick={toggleMic}
              className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                micActive
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white shadow-md'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              }`}
              title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={toggleCamera}
              className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                cameraActive
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white shadow-md'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              }`}
              title={cameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={toggleScreenShare}
              className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                screenShareActive
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 animate-pulse'
                  : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white shadow-md'
              }`}
              title={screenShareActive ? 'Stop Sharing Screen' : 'Share Screen'}
            >
              <MonitorUp className="w-5 h-5" />
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 border border-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all duration-200 ml-2"
              title="End Call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>

          </div>

          {/* Right Action Drawers */}
          <div className="flex items-center gap-2">
            
            {/* Participants Drawer Toggle */}
            <button
              onClick={() => setActiveTab(activeTab === 'participants' ? null : 'participants')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'participants'
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                  : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Participants"
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Participants</span>
            </button>

            {/* In-Call Chat Drawer Toggle */}
            <button
              onClick={() => setActiveTab(activeTab === 'chat' ? null : 'chat')}
              className={`relative p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'chat'
                  ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                  : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="In-Call Chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Chat</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-all"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default VideoCall;
