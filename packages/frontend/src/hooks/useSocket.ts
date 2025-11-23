import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

type EventHandler = (...args: any[]) => void;

export function useSocket(room?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const backendUrl = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5001';
    const token = localStorage.getItem('piip_token');
    socketRef.current = io(backendUrl, { transports: ['websocket'], auth: { token } });

    if (room && socketRef.current) {
      socketRef.current.emit('join', room);
    }

    return () => {
      try {
        if (socketRef.current) {
          if (room) socketRef.current.emit('leave', room);
          socketRef.current.disconnect();
        }
      } catch (e) {
        // ignore
      }
    };
    // Intentionally only re-run when `room` changes
  }, [room]);

  const on = useCallback((event: string, handler: EventHandler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  const off = useCallback((event: string, handler?: EventHandler) => {
    if (handler) socketRef.current?.off(event, handler);
    else socketRef.current?.removeAllListeners(event);
  }, []);

  const emit = useCallback((event: string, ...args: any[]) => {
    socketRef.current?.emit(event, ...args);
  }, []);

  // Expose only the helpers; avoid exposing ref.current during render to satisfy eslint
  return {
    on,
    off,
    emit,
  };
}

export default useSocket;
