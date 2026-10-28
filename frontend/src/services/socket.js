import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  try {
    const url = new URL(apiBase);
    return `${url.protocol}//${url.hostname}:${url.port || (url.protocol === 'https:' ? '443' : '80')}`;
  } catch (e) {
    return 'http://localhost:5001';
  }
};

let socket = null;

export const getAppSocket = () => {
  if (!socket) {
    const url = getSocketUrl();
    socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      console.log(`[Realtime Socket] Connected: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Realtime Socket] Disconnected: ${reason}`);
    });
  }
  return socket;
};
