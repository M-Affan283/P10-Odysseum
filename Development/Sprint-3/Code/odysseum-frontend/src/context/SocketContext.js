import React, { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { getAccessToken } from '../utils/tokenUtils';
import useUserStore from './userStore';

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

            socketRef.current = io(`${process.env.API_URL}`, {
                auth: { token },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });

        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    };

    const sendMessage = (messageData) => {
        if (socketRef.current) {
            socketRef.current.emit('send_message', messageData);
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
        if (socketRef.current) {
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