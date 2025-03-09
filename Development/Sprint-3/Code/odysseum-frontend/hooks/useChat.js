import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import axiosInstance from '../utils/axios';
import { validateMessage } from '../utils/chatUtils';

export const useChat = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chatDetails, setChatDetails] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const {
        subscribeToMessages,
        unsubscribeFromMessages,
        subscribeToTyping,
        unsubscribeFromTyping,
        sendMessage: socketSendMessage,
        emitTyping
    } = useSocket();

    useEffect(() => {
        fetchChatDetails();
        fetchMessages();

        const handleNewMessage = (data) => {
            if (data.message.chatId === chatId) {
                setMessages(prev => [data.message, ...prev]);
                markMessagesAsRead();
            }
        };

        const handleTypingStatus = ({ userId, status }) => {
            if (chatDetails?.otherUser?._id === userId) {
                setIsTyping(status);
            }
        };

        subscribeToMessages(handleNewMessage);
        subscribeToTyping(handleTypingStatus);

        return () => {
            unsubscribeFromMessages(handleNewMessage);
            unsubscribeFromTyping(handleTypingStatus);
        };
    }, [chatId]);

    const fetchChatDetails = async () => {
        try {
            const response = await axiosInstance.get('/chat/getChatById', {
                params: { chatId }
            });
            setChatDetails(response.data.chat);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch chat details');
        }
    };

    const fetchMessages = async (pageNum = 1) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/chat/getChatMessages', {
                params: {
                    chatId,
                    page: pageNum,
                    limit: 20
                }
            });

            if (pageNum === 1) {
                setMessages(response.data.messages);
            } else {
                setMessages(prev => [...prev, ...response.data.messages]);
            }

            setHasMore(response.data.pagination.hasMore);
            setPage(pageNum);

            if (pageNum === 1) {
                markMessagesAsRead();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            await axiosInstance.post('/chat/mark_read', { chatId });
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    };

    const sendMessage = async (content) => {
        const validation = validateMessage(content);
        if (!validation.isValid) {
            setError(validation.error);
            return;
        }

        const messageData = {
            receiverId: chatDetails.otherUser._id,
            content,
            chatId
        };

        socketSendMessage(messageData);
    };

    const handleTyping = (isTyping) => {
        if (chatDetails?.otherUser?._id) {
            emitTyping(chatDetails.otherUser._id, isTyping);
        }
    };

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchMessages(page + 1);
        }
    }, [loading, hasMore, page]);

    const refresh = useCallback(() => {
        setPage(1);
        fetchMessages(1);
    }, []);

    return {
        messages,
        loading,
        error,
        chatDetails,
        isTyping,
        hasMore,
        sendMessage,
        handleTyping,
        loadMore,
        refresh,
        setError
    };
};

export default useChat;