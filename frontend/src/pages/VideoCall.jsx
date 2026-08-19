import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { 
  Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff, Users, 
  MessageSquare, Maximize2, Minimize2, Grid, Tv, Send, 
  Award, GraduationCap, Sparkles, X, HelpCircle, MonitorCheck,
  CheckCircle2, Volume2
} from 'lucide-react';
import { io } from 'socket.io-client';
import Peer from 'peerjs';

const VideoCall = () => {
  const { bookingId } = useParams();
  const { user } = useContext(AuthContext);
  const { bookings, completeBooking } = useContext(AppContext);
  const navigate = useNavigate();

  // WebRTC & Stream states
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [peerName, setPeerName] = useState('Remote Participant');
  const [connectionState, setConnectionState] = useState('connecting'); // 'connecting' | 'connected' | 'demo'
  
  // Media & Layout controls
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [peerScreenShareActive, setPeerScreenShareActive] = useState(false);
  const [peerMediaState, setPeerMediaState] = useState({ camera: true, mic: true });
  
  // UI & View Mode controls (Google Meet / Zoom parity)
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
  const screenVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const chatBottomRef = useRef(null);
  const containerRef = useRef(null);

  // Current Session info
  const booking = bookings.find(b => b.id === bookingId);
  const isMentor = user?.role === 'mentor';

  useEffect(() => {
    if (booking) {
      setPeerName(isMentor ? booking.studentName || 'Junior Student' : booking.mentorName);
    }

    // Initialize local media stream
    initializeLocalStream();

    return () => {
      // Clean up streams & sockets on unmount
      stopAllTracks();
    };
  }, [bookingId]);

  useEffect(() => {
    if (activeTab === 'chat') {
      setUnreadChatCount(0);
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, chatMessages]);

  // Stream cleanup helper
  const stopAllTracks = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
  };

  // 1. Initialize Local Camera/Microphone Stream
  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      initializeWebRTC(stream);
    } catch (err) {
      console.warn('[WebRTC] Native camera access unavailable or denied. Initializing simulated media stream.', err);
      // Fallback: Create dynamic canvas stream for demo/testing mode
      const mockCanvasStream = createSimulatedCanvasStream(user?.name || 'You');
      setLocalStream(mockCanvasStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mockCanvasStream;
      }
      setConnectionState('demo');
      initializeWebRTC(mockCanvasStream);
    }
  };

  // Canvas-based dynamic animated stream generator for fallback/testing environments
  const createSimulatedCanvasStream = (label) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    let frame = 0;

    const draw = () => {
      frame++;
      // Smooth gradient background animation
      const gradient = ctx.createLinearGradient(0, 0, 640, 480);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e1b4b');
      gradient.addColorStop(1, '#312e81');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 640, 480);

      // Pulsing video circle
      const radius = 60 + Math.sin(frame * 0.05) * 5;
      ctx.beginPath();
      ctx.arc(320, 210, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Text label
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(label, 320, 215);

      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = '#a5b4fc';
      ctx.fillText('Live Stream Active', 320, 310);

      requestAnimationFrame(draw);
    };
    draw();

    return canvas.captureStream(30);
  };

  // 2. Initialize WebRTC & Socket.io Signaling
  const initializeWebRTC = (stream) => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
    const serverUrl = apiBase.replace(/\/api\/?$/, '');

    // Socket.io connection
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });
    socketRef.current = socket;

    // PeerJS connection
    const peer = new Peer(undefined, {
      host: window.location.hostname,
      port: 5001,
      path: '/peerjs',
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });
    peerRef.current = peer;

    peer.on('open', (peerId) => {
      console.log('[PeerJS] Local Peer ID registered:', peerId);
      setConnectionState('connecting');

      socket.emit('join-room', {
        bookingId,
        userId: user.id,
        userName: user.name,
        peerId
      });
    });

    // Receive incoming call
    peer.on('call', (incomingCall) => {
      console.log('[PeerJS] Incoming call received from remote peer');
      incomingCall.answer(stream);
      currentCallRef.current = incomingCall;

      incomingCall.on('stream', (remoteMediaStream) => {
        console.log('[PeerJS] Connected to remote stream');
        setRemoteStream(remoteMediaStream);
        setConnectionState('connected');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteMediaStream;
        }
      });
    });

    // Handle peer user connected
    socket.on('user-connected', ({ userId, userName, peerId }) => {
      console.log(`[Signaling] Peer connected: ${userName} (${peerId})`);
      if (peerId) {
        const outgoingCall = peer.call(peerId, stream);
        currentCallRef.current = outgoingCall;

        outgoingCall.on('stream', (remoteMediaStream) => {
          setRemoteStream(remoteMediaStream);
          setConnectionState('connected');
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteMediaStream;
          }
        });
      }
    });

    // Listen to media state changes from peer
    socket.on('peer-media-state-change', ({ mediaType, enabled }) => {
      setPeerMediaState(prev => ({ ...prev, [mediaType]: enabled }));
    });

    // Listen to remote screen sharing changes
    socket.on('peer-screen-share-change', ({ isSharing }) => {
      setPeerScreenShareActive(isSharing);
      if (isSharing) {
        setViewMode('stage');
      }
    });

    // Listen to live in-call chat messages
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
      setPeerScreenShareActive(false);
    });
  };

  // Toggle Camera On/Off
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraActive;
      }
    }
    const newCameraState = !cameraActive;
    setCameraActive(newCameraState);

    if (socketRef.current) {
      socketRef.current.emit('media-state-change', {
        bookingId,
        mediaType: 'camera',
        enabled: newCameraState
      });
    }
  };

  // Toggle Microphone Mute/Unmute
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micActive;
      }
    }
    const newMicState = !micActive;
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

      const screenTrack = displayStream.getVideoTracks()[0];
      setScreenStream(displayStream);
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
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
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
      senderName: user.name,
      role: user.role,
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
        senderName: user.name,
        role: user.role,
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
    if (isMentor) {
      if (window.confirm(' Tutoring session finished. Would you like to mark this session as completed?')) {
        await completeBooking(bookingId);
      }
    }
    stopAllTracks();
    navigate(`/${user.role}/dashboard`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-slate-100 font-sans" ref={containerRef}>
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        
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
                {connectionState === 'connected' ? 'Connected (WebRTC HD)' : 'Active (Video Mode)'}
              </span>
            </div>
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
                    ref={screenVideoRef}
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
              </div>
            ) : viewMode === 'grid' ? (
              /* Balanced Grid View (Equal 2 split tiles for Local & Remote) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                
                {/* Tile 1: Local Participant */}
                <div className="relative glass-panel rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[320px]">
                  {localStream ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-20 h-20 rounded-full bg-brand-500/20 border-2 border-brand-500 flex items-center justify-center text-xl font-extrabold text-brand-400">
                        {user?.name?.charAt(0) || 'Y'}
                      </div>
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
                </div>

                {/* Tile 2: Remote Peer */}
                <div className="relative glass-panel rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[320px]">
                  {connectionState === 'connected' && remoteStream ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 text-center p-6">
                      <img
                        src={isMentor ? "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150" : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
                        alt={peerName}
                        className="w-24 h-24 rounded-full border-2 border-indigo-500 object-cover shadow-lg"
                      />
                      <div>
                        <h4 className="text-base font-bold text-white">{peerName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {peerMediaState.camera ? 'Video Connected' : 'Camera Off'}
                        </p>
                      </div>
                    </div>
                  )}

                  {!peerMediaState.camera && (
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

              </div>
            ) : (
              /* Stage View Default: Main Featured Peer View + Side Rail Pip Local View */
              <div className="relative flex-1 glass-panel rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[420px]">
                
                {/* Main Featured Remote Stream */}
                {connectionState === 'connected' && remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="relative">
                      <img
                        src={isMentor ? "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200" : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200"}
                        alt={peerName}
                        className="w-32 h-32 rounded-full border-4 border-indigo-500/50 object-cover shadow-2xl animate-pulse"
                      />
                      <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{peerName}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {isMentor ? 'Student Mentee' : 'Senior Peer Mentor'} • {booking?.department || 'Academic Peer'}
                      </p>
                    </div>
                  </div>
                )}

                {!peerMediaState.camera && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <VideoOff className="w-10 h-10 text-slate-600" />
                    <p className="text-sm font-semibold">{peerName} paused video</p>
                  </div>
                )}

                {!peerMediaState.mic && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5">
                    <MicOff className="w-3.5 h-3.5" />
                    {peerName} Muted
                  </div>
                )}

                {/* PiP Local Video Thumbnail (Bottom-Right overlay) */}
                <div className="absolute bottom-4 right-4 w-40 sm:w-48 aspect-video rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-900 group">
                  {localStream ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-xs text-slate-400 font-bold">
                      {user?.name}
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
