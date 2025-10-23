import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocket = (documentId) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001');
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setConnected(true);
      setSocket(newSocket);
      
      if (documentId) {
        newSocket.emit('join-document', documentId);
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('document-users', (userList) => {
      setUsers(userList);
    });

    newSocket.on('user-joined', (user) => {
      setUsers(prev => [...prev, user]);
    });

    newSocket.on('user-left', (userId) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && documentId) {
      socket.emit('join-document', documentId);
    }
  }, [documentId, socket]);

  return { socket, connected, users };
};