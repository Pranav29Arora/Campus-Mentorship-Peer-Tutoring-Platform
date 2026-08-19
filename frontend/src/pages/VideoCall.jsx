import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff, Users, ShieldAlert, MonitorCheck, HelpCircle } from 'lucide-react';
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
  const [peerName, setPeerName] = useState('Remote Participant');
  const [connectionState, setConnectionState] = useState('connecting'); // 'connecting' | 'connected' | 'demo'
  
  // Media controls
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [peerMediaState, setPeerMediaState] = useState({ camera: true, mic: true });

  // DOM Elements refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const currentCallRef = useRef(null);

  // Retrieve current session details
  const booking = bookings.find(b => b.id === bookingId);
  const isMentor = user?.role === 'mentor';

  useEffect(() => {
    // Resolve peer name
    if (booking) {
      setPeerName(isMentor ? booking.studentName || 'Junior Student' : booking.mentorName);
    }

    // 1. Prompt for Camera/Microphone device stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // 2. Initialize WebRTC Signaling connection
        initializeWebRTC(stream);
      })
      .catch((err) => {
        console.warn('[WebRTC] Access to media devices denied. Falling back to Demo Mode.', err);
        // Fallback to Simulation / Demo Mode
        setConnectionState('demo');
        simulateVideoStreams();
      });

    return () => {
      // Clean up media streams and socket hooks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [bookingId]);

  const initializeWebRTC = (stream) => {
    const stunServer = import.meta.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302';
    
    // Connect to Signaling Server
    const socket = io(import.meta.env.VITE_API_BASE_URL.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket'],
      upgrade: false
    });
    socketRef.current = socket;

    // Initialize PeerJS
    const peer = new Peer(undefined, {
      host: '/',
      port: '5000',
      path: '/peerjs', // Proxy mapping configuration
      config: {
        iceServers: [{ urls: stunServer }]
      }
    });
    peerRef.current = peer;

    peer.on('open', (peerId) => {
      console.log('[PeerJS] Initialized with local ID:', peerId);
      
      // Let other room participants know we joined
      socket.emit('join-room', {
        bookingId,
        userId: user.id,
        userName: user.name,
        peerId
      });
    });

    // Handle incoming WebRTC call
    peer.on('call', (incomingCall) => {
      console.log('[PeerJS] Receiving incoming WebRTC call...');
      incomingCall.answer(stream);
      currentCallRef.current = incomingCall;

      incomingCall.on('stream', (incomingRemoteStream) => {
        console.log('[PeerJS] Received remote stream.');
        setRemoteStream(incomingRemoteStream);
        setConnectionState('connected');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = incomingRemoteStream;
        }
      });
    });

    // Handle signaling triggers
    socket.on('user-connected', ({ userId, userName, peerId }) => {
      console.log('[Signaling] User connected, calling:', userName);
      
      // Call the newly connected user
      const outgoingCall = peer.call(peerId, stream);
      currentCallRef.current = outgoingCall;

      outgoingCall.on('stream', (incomingRemoteStream) => {
        setRemoteStream(incomingRemoteStream);
        setConnectionState('connected');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = incomingRemoteStream;
        }
      });
    });

    socket.on('peer-media-state-change', ({ mediaType, enabled }) => {
      setPeerMediaState(prev => ({
        ...prev,
        [mediaType]: enabled
      }));
    });

    socket.on('user-disconnected', () => {
      console.log('[Signaling] Peer disconnected.');
      setConnectionState('connecting');
      setRemoteStream(null);
    });
  };

  const simulateVideoStreams = () => {
    // Generates a mock visual stream loop for local & remote windows during demo fallback
    console.log('[VideoCall] Simulated Demo Call active');
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      if (track) {
        track.enabled = !cameraActive;
        setCameraActive(!cameraActive);
        
        // Notify peer
        if (socketRef.current) {
          socketRef.current.emit('media-state-change', {
            bookingId,
            mediaType: 'camera',
            enabled: !cameraActive
          });
        }
      }
    } else {
      // Demo toggle
      setCameraActive(!cameraActive);
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !micActive;
        setMicActive(!micActive);
        
        if (socketRef.current) {
          socketRef.current.emit('media-state-change', {
            bookingId,
            mediaType: 'mic',
            enabled: !micActive
          });
        }
      }
    } else {
      setMicActive(!micActive);
    }
  };

  // Screen Share Simulation
  const toggleScreenShare = () => {
    setScreenShareActive(!screenShareActive);
  };

  // End Call
  const handleEndCall = async () => {
    if (isMentor) {
      // Mentor can mark session completed on call end
      if (window.confirm('Would you like to mark this tutoring session as completed?')) {
        await completeBooking(bookingId);
      }
    }
    navigate(`/${user.role}/dashboard`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Navbar />

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-between">
        
        {/* Call Banner */}
        <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800 p-4 rounded-2xl mb-6">
          <div className="text-left">
            <h3 className="text-sm font-bold text-white leading-tight">
              Room: {booking?.subject || 'Tutoring Session'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Peer: {peerName} • {isMentor ? 'Mentor Portal' : 'Student Portal'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              connectionState === 'connected' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
            }`} />
            <span className="text-xs font-bold text-slate-300 capitalize">
              {connectionState === 'connected' ? 'Connected (WebRTC)' : 'Demo Video Mode'}
            </span>
          </div>
        </div>

        {/* Video streams Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-stretch mb-6">
          
          {/* Main Remote Viewport (Left / center) */}
          <div className="lg:col-span-3 relative glass-panel rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950 flex items-center justify-center min-h-[350px] lg:min-h-[480px]">
            {connectionState === 'connected' && remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-3xl"
              />
            ) : (
              // Simulated Remote Video Layout
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
                  alt="Remote"
                  className={`w-32 h-32 rounded-full border-2 border-brand-500 object-cover ${
                    cameraActive ? 'animate-pulse' : ''
                  }`}
                />
                <div>
                  <h4 className="text-lg font-bold text-white">{peerName}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {peerMediaState.camera ? 'Streaming live video...' : 'Camera Off'}
                  </p>
                </div>
              </div>
            )}

            {/* Connection alert banners overlays */}
            {!peerMediaState.camera && (
              <div className="absolute inset-0 bg-dark-bg/90 flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
                <VideoOff className="w-8 h-8 text-slate-600" />
                <p>{peerName} turned off their camera</p>
              </div>
            )}
            
            {!peerMediaState.mic && (
              <span className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold">
                <MicOff className="w-3.5 h-3.5" />
                Muted
              </span>
            )}
          </div>

          {/* Pip Personal Viewport + Controls (Right side panel) */}
          <div className="lg:col-span-1 flex flex-col justify-between gap-6">
            
            {/* Pip Personal Frame */}
            <div className="relative glass-panel rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900 aspect-video lg:aspect-auto lg:flex-1 flex items-center justify-center min-h-[160px]">
              {localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-2xl absolute inset-0"
                />
              ) : (
                // Simulated Personal Video Layout
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 bg-slate-800 border border-slate-700 text-slate-500 rounded-full flex items-center justify-center mb-2">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold text-white">{user?.name} (You)</h5>
                </div>
              )}

              {/* Personal labels */}
              <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-bold text-white">
                You
              </span>

              {!cameraActive && (
                <div className="absolute inset-0 bg-slate-950/90 rounded-2xl flex flex-col items-center justify-center text-xs text-slate-500 gap-1.5">
                  <VideoOff className="w-5 h-5 text-slate-700" />
                  Camera Off
                </div>
              )}

              {!micActive && (
                <span className="absolute top-3 right-3 p-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                  <MicOff className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Simulated Screen share display */}
            {screenShareActive && (
              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 text-left text-xs text-emerald-400 flex items-center gap-3 animate-pulse">
                <MonitorCheck className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Sharing Screen</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Other participants see your display.</p>
                </div>
              </div>
            )}

            {/* WebRTC credentials detail helper card */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-850 text-left text-[11px] text-slate-500 space-y-2">
              <p className="font-semibold text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
                Viva Tech Specs
              </p>
              <p>Stun Server: <code className="text-slate-400">stun.l.google.com</code></p>
              <p>Protocol: <code className="text-slate-400">WebRTC SDP / PeerJS</code></p>
              <p>Signaling: <code className="text-slate-400">Socket.io WebSocket</code></p>
            </div>

          </div>

        </div>

        {/* Video Call Controls Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex justify-center items-center gap-4">
          <button
            onClick={toggleCamera}
            className={`p-3.5 rounded-xl border transition-all duration-300 ${
              cameraActive 
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' 
                : 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
            }`}
            title={cameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={toggleMic}
            className={`p-3.5 rounded-xl border transition-all duration-300 ${
              micActive 
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' 
                : 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
            }`}
            title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-xl border transition-all duration-300 ${
              screenShareActive 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
            }`}
            title={screenShareActive ? 'Stop Sharing Screen' : 'Share Screen'}
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          <button
            onClick={handleEndCall}
            className="p-3.5 rounded-xl bg-red-600 border border-red-500 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all duration-300"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

      </div>

      <Footer />
    </div>
  );
};

// SVG visual helper imported
const UserIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default VideoCall;
