import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    FlatList, 
    TouchableOpacity,
    KeyboardAvoidingView, 
    Platform,
    ActivityIndicator,
    Image
} from 'react-native';
import { io } from 'socket.io-client';
import useUserStore from '../context/userStore';
import Toast from 'react-native-toast-message';
import axiosInstance from '../utils/axios';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { router } from 'expo-router';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";
import images from '../../assets/images/images';
import { getAccessToken } from '../utils/tokenUtils';

// Message status constants
const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
};

const ChatScreen = ({ chatId }) => {
    const user = useUserStore(state => state.user);
    const [receiverUser, setReceiverUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [error, setError] = useState(null);
    const flatListRef = useRef(null);
    const [isReceiverOnline, setIsReceiverOnline] = useState(false);
    const [isReceiverTyping, setIsReceiverTyping] = useState(false);
    const [lastSeen, setLastSeen] = useState(null);
    const typingTimeoutRef = useRef(null);
    
    // Fetch chat details on mount to get recipient user details
    const fetchChatDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/chat/getChatById', {
                params: { chatId, userId: user._id }
            });
            setReceiverUser(response.data.chat.otherUser);

            const messagesResponse = await axiosInstance.get('/chat/getChatMessages', {
                params: { chatId, userId: user._id }
            });
            
            if (messagesResponse.data.messages) {
                const formattedMessages = messagesResponse.data.messages.map(msg => ({
                    id: msg._id,
                    text: msg.content,
                    timestamp: new Date(msg.createdAt),
                    sender: msg.sender._id,
                    isOwnMessage: msg.sender._id === user._id,
                    status: msg.status || MESSAGE_STATUS.DELIVERED // Add default status
                }));
                
                setMessages(formattedMessages);
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching chat details:', err);
            setError('Failed to fetch chat details');
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load chat messages'
            });
            setIsLoading(false);
        }
    }, [chatId, user._id]); // Add user._id as dependency
    
    useEffect(()=>{
        fetchChatDetails();
    }, []);

    // Fix async effect - convert to proper IIFE pattern
    useEffect(() => {
        const setupSocket = async () => {
            try {
                // Connect to your socket server
                const socketUrl = axiosInstance.defaults.baseURL.replace('/api', '');
                const token = await getAccessToken();
                const newSocket = io(socketUrl, {
                    query: { userId: user._id },
                    auth: { token },
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    timeout: 20000,
                    forceNew: true,
                });

                newSocket.on('connect', () => {
                    console.log('Connected to socket server');
                    setIsConnected(true);

                    // Request undelivered messages when connecting
                    newSocket.emit('getUndeliveredMessages', {
                        userId: user._id,
                        chatId: chatId
                    });
                });

                newSocket.on('reconnect', () => {
                    console.log('Reconnected to socket server');
                    setIsConnected(true);
                    
                    // Request undelivered messages after reconnecting
                    newSocket.emit('getUndeliveredMessages', {
                        userId: user._id,
                        chatId: chatId
                    });
                });

                newSocket.on('message', (message) => {
                    // Check for duplicate messages
                    setMessages(prevMessages => {
                        // Check if message already exists
                        const messageExists = prevMessages.some(msg => msg.id === message._id);
                        if (messageExists) return prevMessages;

                        return [
                            ...prevMessages,
                            {
                                id: message._id,
                                text: message.content,
                                timestamp: new Date(message.createdAt),
                                sender: message.sender,
                                isOwnMessage: message.sender === user._id,
                                status: MESSAGE_STATUS.DELIVERED
                            }
                        ];
                    });

                    // Send a message read confirmation to the server
                    newSocket.emit('messageRead', {
                        messageId: message._id,
                        senderId: message.sender,
                        receiverId: user._id,
                        readAt: new Date(),
                        chatId: message.chatId || chatId
                    });
                });
                
                newSocket.on('messageQueued', (data) => {
                    // Add queued message to chat
                    console.log('Received queued message:', data);
                    setMessages(prevMessages => {
                        const updatedMessages = prevMessages.map(msg =>
                            msg.id === data.messageId ? { ...msg, status: MESSAGE_STATUS.SENT } : msg
                        );
                        return [...updatedMessages]; // Forces React to re-render
                    });
                });

                newSocket.on('messageRead', (data) => {
                    console.log('Message read:', data.messageId);
                    setMessages(prevMessages => {
                        const updatedMessages = prevMessages.map(msg =>
                            msg.id === data.messageId ? { ...msg, status: MESSAGE_STATUS.READ } : msg
                        );
                        return [...updatedMessages]; // Forces React to re-render
                    });
                });

                newSocket.on('messageDelivered', (data) => {
                    console.log('Message delivered:', data.messageId);
                    setMessages(prevMessages => {
                        const updatedMessages = prevMessages.map(msg =>
                            msg.id === data.messageId ? { ...msg, status: MESSAGE_STATUS.DELIVERED } : msg
                        );
                        return [...updatedMessages]; // Forces React to re-render
                    });
                });
                
                newSocket.on('messageError', (data) => {
                    setMessages(prevMessages =>
                        prevMessages.map(msg =>
                            msg.id === data.messageId ? { ...msg, status: 'failed' } : msg
                        )
                    );
                    
                    Toast.show({
                        type: 'error',
                        text1: 'Failed to send message',
                        text2: data.error
                    });
                });

                // Add handlers for typing indicators
                newSocket.on('userTyping', (data) => {
                    if (data.chatId === chatId && data.userId === receiverUser?._id) {
                        setIsReceiverTyping(true);
                    }
                });

                newSocket.on('userStoppedTyping', (data) => {
                    if (data.chatId === chatId && data.userId === receiverUser?._id) {
                        setIsReceiverTyping(false);
                    }
                });

                // Add handler for user status updates
                newSocket.on('userStatus', (data) => {
                    if (receiverUser && data.userId === receiverUser._id) {
                        setIsReceiverOnline(data.isOnline);
                        if (!data.isOnline && data.lastSeen) {
                            setLastSeen(new Date(data.lastSeen));
                        }
                    }
                });

                newSocket.on('disconnect', () => {
                    console.log('Disconnected from socket server');
                    setIsConnected(false);
                });

                newSocket.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                    setIsConnected(false);
                    Toast.show({
                        type: 'error',
                        text1: 'Connection Error',
                        text2: 'Unable to connect to chat server'
                    });
                });

                setSocket(newSocket);

                return () => {
                    if (newSocket) {
                        // Notify server when user leaves chat
                        newSocket.emit('logout');
                        
                        newSocket.off('connect');
                        newSocket.off('reconnect');
                        newSocket.off('message');
                        newSocket.off('messageQueued');
                        newSocket.off('messageRead');
                        newSocket.off('messageDelivered');
                        newSocket.off('messageError');
                        newSocket.off('userTyping');
                        newSocket.off('userStoppedTyping');
                        newSocket.off('userStatus');
                        newSocket.off('disconnect');
                        newSocket.off('connect_error');
                        newSocket.disconnect();
                    }
                };
            } catch (error) {
                console.error('Socket setup error:', error);
                setError('Failed to connect to chat server');
                setIsConnected(false);
            }
        };

        setupSocket();
    }, [user._id, chatId, receiverUser]); // Add receiverUser as dependency

    useEffect(() => {
        if (!socket || !isConnected || messages.length === 0) return;

        const unreadMessages = messages.filter(
            msg => !msg.isOwnMessage && msg.status !== MESSAGE_STATUS.READ
        );

        if (unreadMessages.length === 0) return;

        unreadMessages.forEach(msg => {
            socket.emit('messageRead', {
                messageId: msg.id,
                senderId: msg.sender,
                receiverId: user._id,
                readAt: new Date(),
                chatId: chatId
            });
        });

        setMessages(prevMessages =>
            prevMessages.map(msg =>
                !msg.isOwnMessage ? { ...msg, status: MESSAGE_STATUS.READ } : msg
            )
        );
    }, [isConnected, messages, socket, user._id, chatId]);

    // Handle user typing
    const handleTyping = (text) => {
        setInputMessage(text);
        
        if (!socket || !isConnected || !receiverUser) return;
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Only emit typing event if there's text
        if (text.trim().length > 0) {
            socket.emit('typing', {
                chatId,
                receiverId: receiverUser._id
            });
            
            // Stop typing after 3 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stopTyping', {
                    chatId,
                    receiverId: receiverUser._id
                });
            }, 3000);
        } else {
            // If text is empty, stop typing immediately
            socket.emit('stopTyping', {
                chatId,
                receiverId: receiverUser._id
            });
        }
    };

    const sendMessage = () => {
        if (inputMessage.trim() && socket && isConnected && receiverUser) {
            // Clear typing timeout and notify that we stopped typing
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            socket.emit('stopTyping', {
                chatId,
                receiverId: receiverUser._id
            });
            
            const messageId = uuidv4();
            const timestamp = new Date();
            
            const newMessage = {
                id: messageId,
                text: inputMessage,
                timestamp,
                sender: user._id,
                isOwnMessage: true,
                status: MESSAGE_STATUS.SENDING
            };
            
            setMessages(prevMessages => [...prevMessages, newMessage]);
            
            socket.emit('sendMessage', {
                senderId: user._id,
                receiverId: receiverUser._id,
                text: inputMessage,
                messageId,
                createdAt: timestamp,
                chatId
            });
        
            setTimeout(() => {
                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === messageId ? { ...msg, status: MESSAGE_STATUS.SENT } : msg
                    )
                );
            }, 500);
            
            setInputMessage('');
        }
    };

    const retryMessage = (messageId) => {
        if (!socket || !isConnected || !receiverUser) return;
        
        const messageToRetry = messages.find(msg => msg.id === messageId);
        if (!messageToRetry) return;
        
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId ? { ...msg, status: MESSAGE_STATUS.SENDING } : msg
            )
        );
        
        socket.emit('sendMessage', {
            senderId: user._id,
            receiverId: receiverUser._id,
            text: messageToRetry.text,
            messageId: messageToRetry.id,
            createdAt: new Date(),
            chatId
        });
        
        setTimeout(() => {
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === messageId ? { ...msg, status: MESSAGE_STATUS.SENT } : msg
                )
            );
        }, 500);
    };

    const formatTime = (date) => {
        return date instanceof Date 
            ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
            : '';
    };

    const formatLastSeen = (date) => {
        if (!date) return '';
        
        const now = new Date();
        const diff = now - date;
        
        // Less than a minute
        if (diff < 60000) {
            return 'just now';
        }
        
        // Less than an hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        }
        
        // Less than a day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        }
        
        // Format as date
        return date.toLocaleDateString();
    };

    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef?.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const renderMessageStatus = (status) => {
        switch(status) {
            case MESSAGE_STATUS.SENDING:
                return <Ionicons name="time-outline" size={14} color="white" />;
            case MESSAGE_STATUS.SENT:
                return <Ionicons name="checkmark-outline" size={14} color="white" />;
            case MESSAGE_STATUS.DELIVERED:
                return <Ionicons name="checkmark-done-outline" size={14} color="white" />;
            case MESSAGE_STATUS.READ:
                return <Ionicons name="checkmark-done-outline" size={14} color="#8B5CF6" />;
            case 'failed':
                return <Ionicons name="alert-circle-outline" size={14} color="red" />;
            default:
                return null;
        }
    };

    const renderMessage = ({ item }) => {
        return (
            <View className={`my-1 flex flex-row ${item.isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <View className={`max-w-4/5 p-3 rounded-2xl ${
                    item.isOwnMessage 
                    ? 'bg-purple-600 rounded-br-md' 
                    : 'bg-gray-700 rounded-bl-md'
                }`}>
                    <Text className="text-white text-base">{item.text}</Text>
                    
                    <View className="flex-row justify-end items-center mt-1">
                        <Text className="text-xs text-gray-300 mr-1">{formatTime(item.timestamp)}</Text>
                        {item.isOwnMessage && (
                            <View className="w-4 h-4 justify-center items-center">
                                {item.status === 'failed' ? (
                                    <TouchableOpacity onPress={() => retryMessage(item.id)}>
                                        <Ionicons name="alert-circle-outline" size={14} color="red" />
                                    </TouchableOpacity>
                                ) : (
                                    renderMessageStatus(item.status)
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };
    
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-primary justify-center items-center">
                <ActivityIndicator size="large" color="#8C00E3" />
                <Text className="text-gray-400 mt-4">Loading chat...</Text>
            </SafeAreaView>
        );
    }

    if (!isConnected) {
        return (
            <SafeAreaView className="flex-1 bg-primary justify-center items-center">
                <ActivityIndicator size="large" color="#8C00E3" />
                <Text className="text-gray-400 mt-4">Connecting...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-primary">
            <View className="flex-row items-center p-4 border-b border-gray-700">
                <TouchableOpacity 
                    className="p-2 mr-2" 
                    onPress={() => router.back()}
                >
                    <ArrowLeftIcon size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    className="flex-row items-center"
                    onPress={() => {
                        /* Navigate to user profile if needed */
                    }}
                >
                    <Image 
                        source={{ uri: receiverUser?.profilePicture || images.DefaultProfileImg }}
                        className="w-10 h-10 rounded-full"
                    />
                    <View className="ml-3">
                        <Text className="text-white font-semibold text-lg">
                            {receiverUser?.username || "User"}
                        </Text>
                        <Text className="text-xs text-gray-400">
                            {isReceiverTyping ? 'Typing...' : 
                             isReceiverOnline ? 'Online' : 
                             lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : ''}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    className="flex-1"
                    contentContainerStyle={{ padding: 12 }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={15}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    removeClippedSubviews={true}
                    ListEmptyComponent={() => (
                        <View className="flex-1 justify-center items-center p-4 mt-10">
                            <Text className="text-gray-400 text-center">
                                No messages yet. Start the conversation!
                            </Text>
                        </View>
                    )}
                    onEndReachedThreshold={0.5}
                />
                
                <View className="flex-row items-center p-4 border-t border-gray-700 bg-gray-800">
                    <TextInput
                        className="flex-1 min-h-10 max-h-24 bg-gray-700 rounded-full px-4 py-2 mr-3 text-white"
                        value={inputMessage}
                        onChangeText={handleTyping}
                        placeholder="Type a message..."
                        placeholderTextColor="gray"
                        multiline
                    />
                    <TouchableOpacity 
                        className={`w-12 h-12 rounded-full items-center justify-center ${
                            inputMessage.trim() ? 'bg-purple-600' : 'bg-purple-800 opacity-50'
                        }`}
                        onPress={sendMessage}
                        disabled={!inputMessage.trim()}
                    >
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {error && (
                <View className="absolute bottom-20 left-0 right-0 items-center">
                    <TouchableOpacity 
                        className="bg-red-500 px-4 py-2 rounded-full"
                        onPress={() => {
                            setError(null);
                            fetchChatDetails();
                        }}
                    >
                        <Text className="text-white">Error: Tap to retry</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default React.memo(ChatScreen);