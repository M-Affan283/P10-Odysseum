import React, { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { getAccessToken } from '../utils/tokenUtils';
import useUserStore from './userStore';
import { Platform } from 'react-native';
import axiosInstance from '../utils/axios';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const user = useUserStore(state => state.user);
    const isLoggedIn = useUserStore(state => state.isLoggedIn);

    useEffect(() => {
        if (isLoggedIn && user) {
            initializeSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [isLoggedIn, user]);

    const initializeSocket = async () => {
        try {
            const token = await getAccessToken();
            
            // Use the same base URL as your axios instance
            const socketUrl = axiosInstance.defaults.baseURL.replace('/api', '');
            
            socketRef.current = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000,
                forceNew: true
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected successfully');
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                // Try to reconnect with polling if websocket fails
                if (error.message === 'websocket error') {
                    socketRef.current.io.opts.transports = ['polling', 'websocket'];
                }
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });

        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    };

    const sendMessage = (messageData) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('send_message', messageData);
        } else {
            console.error('Socket not connected');
        }
    };

    const subscribeToMessages = (callback) => {
        if (socketRef.current) {
            socketRef.current.on('receive_message', callback);
        }
    };

    const unsubscribeFromMessages = (callback) => {
        if (socketRef.current) {
            socketRef.current.off('receive_message', callback);
        }
    };

    const emitTyping = (receiverId, isTyping) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(
                isTyping ? 'typing_start' : 'typing_end',
                { receiverId }
            );
        }
    };

    const subscribeToTyping = (callback) => {
        if (socketRef.current) {
            socketRef.current.on('user_typing', callback);
        }
    };

    const unsubscribeFromTyping = (callback) => {
        if (socketRef.current) {
            socketRef.current.off('user_typing', callback);
        }
    };

    const value = {
        socket: socketRef.current,
        sendMessage,
        subscribeToMessages,
        unsubscribeFromMessages,
        emitTyping,
        subscribeToTyping,
        unsubscribeFromTyping
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;