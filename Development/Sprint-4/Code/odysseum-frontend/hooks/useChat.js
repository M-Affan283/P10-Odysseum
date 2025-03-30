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

    const { 
        socket, 
        sendMessage: socketSendMessage, 
        subscribeToMessages, 
        unsubscribeFromMessages, 
        subscribeToTyping, 
        unsubscribeFromTyping,
        markMessagesAsRead,
        subscribeToMessagesRead,
        unsubscribeFromMessagesRead
    } = useSocket();
    
    const messagesRef = useRef(messages);
    const initialFetchDoneRef = useRef(false);
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
        if (loading || !chatId) return;

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
            
            // Mark messages as read when we fetch them
            if (response.data.messages.length > 0) {
                markMessagesAsRead(chatId);
            }

        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    }, [chatId, loading, markMessagesAsRead]);

    // Handle message events
    const handleNewMessage = useCallback((data) => {
        if (data.message?.chatId === chatId) {
            // Update messages list
            setMessages(prev => {
                // Check if message already exists
                const messageExists = prev.some(msg => msg._id === data.message._id);
                if (messageExists) return prev;
                
                // Mark as read immediately if received from other user
                if (data.message.sender._id !== data.message.receiver) {
                    markMessagesAsRead(chatId);
                }
                
                return [data.message, ...prev];
            });
            
            // Also update chat details to reflect latest message
            fetchChatDetails();
        }
    }, [chatId, markMessagesAsRead, fetchChatDetails]);

    // Handle messages read event
    const handleMessagesRead = useCallback((data) => {
        if (data.chatId === chatId) {
            // Update message read status
            setMessages(prev => 
                prev.map(msg => ({
                    ...msg,
                    read: true
                }))
            );
        }
    }, [chatId]);

    // Initial data fetch - only once when chatId is provided
    useEffect(() => {
        if (chatId && !initialFetchDoneRef.current) {
            initialFetchDoneRef.current = true;
            fetchChatDetails();
            fetchMessages();
        }
        
        return () => {
            // Reset the flag when component unmounts or chatId changes
            initialFetchDoneRef.current = false;
        };
    }, [chatId, fetchChatDetails, fetchMessages]);

    // Mark messages as read when chat is opened
    useEffect(() => {
        if (chatId && socket) {
            markMessagesAsRead(chatId);
        }
    }, [chatId, socket, markMessagesAsRead]);

    // Set up socket event listeners
    useEffect(() => {
        if (!socket || !chatId) return;

        // Subscribe to messages and typing events
        subscribeToMessages(handleNewMessage);
        subscribeToTyping(isTyping => setIsTyping(isTyping));
        subscribeToMessagesRead(handleMessagesRead);

        return () => {
            unsubscribeFromMessages(handleNewMessage);
            unsubscribeFromTyping(setIsTyping);
            unsubscribeFromMessagesRead(handleMessagesRead);
        };
    }, [
        socket, 
        chatId, 
        subscribeToMessages, 
        unsubscribeFromMessages, 
        subscribeToTyping, 
        unsubscribeFromTyping, 
        subscribeToMessagesRead,
        unsubscribeFromMessagesRead,
        handleNewMessage,
        handleMessagesRead
    ]);

    const sendMessage = useCallback((content) => {
        if (!chatDetails?.otherUser?._id || !content.trim()) return;

        const messageData = {
            receiverId: chatDetails.otherUser._id,
            content: content.trim(),
            chatId
        };

        socketSendMessage(messageData);
    }, [chatDetails?.otherUser?._id, chatId, socketSendMessage]);

    const handleTyping = useCallback((isTyping) => {
        if (socket && chatDetails?.otherUser?._id) {
            socket.emit(
                isTyping ? 'typing_start' : 'typing_end',
                { receiverId: chatDetails.otherUser._id }
            );
        }
    }, [socket, chatDetails?.otherUser?._id]);

    const refresh = useCallback(() => {
        fetchChatDetails();
        fetchMessages();
    }, [fetchChatDetails, fetchMessages]);

    return {
        messages,
        loading,
        error,
        chatDetails,
        isTyping,
        hasMore,
        sendMessage,
        handleTyping,
        refresh
    };
};

export default useChat;