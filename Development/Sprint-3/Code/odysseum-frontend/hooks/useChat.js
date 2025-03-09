import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../src/context/SocketContext';
import axiosInstance from '../src/utils/axios';

export const useChat = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chatDetails, setChatDetails] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const { socket, sendMessage: socketSendMessage } = useSocket();
    const messagesRef = useRef(messages);
    messagesRef.current = messages;

    const fetchChatDetails = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/chat/getChatById', {
                params: { chatId }
            });
            setChatDetails(response.data.chat);
        } catch (err) {
            console.error('Error fetching chat details:', err);
            setError('Failed to fetch chat details');
        }
    }, [chatId]);

    const fetchMessages = useCallback(async () => {
        if (loading) return;

        try {
            setLoading(true);
            const response = await axiosInstance.get('/chat/getChatMessages', {
                params: {
                    chatId,
                    page: 1,
                    limit: 50
                }
            });

            // Since FlatList is inverted, we need to reverse the messages array
            setMessages(response.data.messages.reverse());
            setHasMore(response.data.pagination.hasMore);

        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    }, [chatId, loading]);

    // Set up socket event listeners
    useEffect(() => {
        if (!socket || !chatId) return;

        const handleNewMessage = (data) => {
            if (data.message?.chatId === chatId) {
                setMessages(prev => {
                    // Check if message already exists
                    const messageExists = prev.some(msg => msg._id === data.message._id);
                    if (messageExists) return prev;
                    return [data.message, ...prev];
                });
            }
        };

        const handleMessageSent = (data) => {
            if (data.message?.chatId === chatId) {
                setMessages(prev => {
                    // Check if message already exists
                    const messageExists = prev.some(msg => msg._id === data.message._id);
                    if (messageExists) return prev;
                    return [data.message, ...prev];
                });
            }
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('message_sent', handleMessageSent);

        return () => {
            socket.off('receive_message', handleNewMessage);
            socket.off('message_sent', handleMessageSent);
        };
    }, [socket, chatId]);

    // Initial data fetch
    useEffect(() => {
        if (chatId) {
            fetchChatDetails();
            fetchMessages();
        }
    }, [chatId, fetchChatDetails, fetchMessages]);

    const sendMessage = useCallback((content) => {
        if (!chatDetails?.otherUser?._id || !content.trim()) return;

        const messageData = {
            receiverId: chatDetails.otherUser._id,
            content: content.trim(),
            chatId
        };

        socketSendMessage(messageData);
    }, [chatDetails?.otherUser?._id, chatId, socketSendMessage]);

    const refresh = useCallback(() => {
        fetchMessages();
    }, [fetchMessages]);

    return {
        messages,
        loading,
        error,
        chatDetails,
        isTyping,
        hasMore,
        sendMessage,
        refresh
    };
};

export default useChat;