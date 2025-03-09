import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../src/context/SocketContext';
import axiosInstance from '../src/utils/axios';
import { validateMessage } from '../src/utils/chatUtils';

export const useChat = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatDetails, setChatDetails] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const initialFetchDone = useRef(false);

  const { 
    socket,
    subscribeToMessages, 
    unsubscribeFromMessages,
    subscribeToTyping,
    unsubscribeFromTyping,
    sendMessage: socketSendMessage,
    emitTyping 
  } = useSocket();

  // Initial fetch of chat details and messages
  useEffect(() => {
    if (!initialFetchDone.current && chatId) {
      fetchChatDetails();
      fetchMessages();
      initialFetchDone.current = true;
    }
    
    return () => {
      initialFetchDone.current = false;
    };
  }, [chatId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (data) => {
      if (data.message.chatId === chatId) {
        setMessages(prev => [data.message, ...prev]);
        socket.emit('mark_read', { chatId });
      }
    };

    const handleMessageSent = (data) => {
      if (data.message.chatId === chatId) {
        setMessages(prev => [data.message, ...prev]);
      }
    };

    const handleTypingStatus = ({ userId, status }) => {
      if (chatDetails?.otherUser?._id === userId) {
        setIsTyping(status);
      }
    };

    // Subscribe to socket events
    socket.on('receive_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleTypingStatus);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('user_typing', handleTypingStatus);
    };
  }, [socket, chatId, chatDetails?.otherUser?._id]);

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
      
      if (socket?.connected) {
        socket.emit('mark_read', { chatId });
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = useCallback((content) => {
    const validation = validateMessage(content);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    if (!chatDetails?.otherUser?._id) {
      setError('Chat not properly initialized');
      return;
    }

    const messageData = {
      receiverId: chatDetails.otherUser._id,
      content,
      chatId
    };
    
    socketSendMessage(messageData);
  }, [chatDetails?.otherUser?._id, chatId, socketSendMessage]);

  const handleTyping = useCallback((isTyping) => {
    if (chatDetails?.otherUser?._id && socket?.connected) {
      emitTyping(chatDetails.otherUser._id, isTyping);
    }
  }, [chatDetails?.otherUser?._id, socket, emitTyping]);

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