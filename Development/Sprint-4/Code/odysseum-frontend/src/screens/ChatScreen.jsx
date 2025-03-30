import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    FlatList, 
    TouchableOpacity, 
    StyleSheet, 
    KeyboardAvoidingView, 
    Platform,
    ActivityIndicator
  } from 'react-native'
import { io } from 'socket.io-client';
import useUserStore from '../context/userStore';
import Toast from 'react-native-toast-message';
import axiosInstance from '../utils/axios';
import { getAccessToken } from '../utils/tokenUtils';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";

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
    
    // Fetch chat details on mount to get recipient user details
    const fetchChatDetails = useCallback(async () => 
    {
        setIsLoading(true);
        try 
        {
            const response = await axiosInstance.get('/chat/getChatById', {
                params: { chatId, userId: user._id }
            });
            // setChatDetails(response.data.chat);
            setReceiverUser(response.data.chat.otherUser);

            const messagesResponse = await axiosInstance.get('/chat/getChatMessages', {
              params: { chatId, userId: user._id }
            });

            // console.log(messagesResponse.data.messages);
            
            if (messagesResponse.data.messages) {
              if (messagesResponse.data.messages) {
                const formattedMessages = messagesResponse.data.messages.map(msg => ({
                  id: msg._id,  // Store server _id as client id
                  text: msg.content,
                  timestamp: new Date(msg.createdAt),
                  sender: msg.sender._id,
                  isOwnMessage: msg.sender._id === user._id,
                  status: msg.status
                }));
                
                setMessages(formattedMessages);
              }
            }
            setIsLoading(false);
        } 
        catch (err) 
        {
            console.error('Error fetching chat details:', err);
            setError('Failed to fetch chat details');
            setIsLoading(false);
        }
    }, [chatId]);


    
    useEffect(()=>
    {
        fetchChatDetails();
    }, []);

    useEffect(() => {
        // Connect to your socket server
        const socketUrl = axiosInstance.defaults.baseURL.replace('/api', '');
        const newSocket = io(socketUrl, {
            query: { userId: user._id },
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            setIsConnected(true);

            // Request undelivered messages when connecting
            newSocket.emit('getUndeliveredMessages');
        });

        // Add reconnection logic
        newSocket.on('reconnect', () => {
          console.log('Reconnected to socket server');
          setIsConnected(true);
          
          // Request undelivered messages after reconnecting
          newSocket.emit('getUndeliveredMessages');
        });

        newSocket.on('message', (message) => {
            // Add received message to chat
            console.log('Received message:', message);
            setMessages(prevMessages => [
              ...prevMessages,
              {
                id: message._id,
                text: message.content,
                timestamp: new Date(message.createdAt),
                sender: message.sender,
                isOwnMessage: message.sender === user._id,
                status: MESSAGE_STATUS.DELIVERED
              }
            ]);

            // Send a message read confirmation to the server
            newSocket.emit('messageRead', {
              messageId: message._id,
              senderId: message.sender,
              receiverId: user._id,
              readAt: new Date(),
              chatId: message.chatId || chatId // Include chatId for unread count
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


        // If message has been read then update the message status on the sender's side
        newSocket.on('messageRead', (data) => {
          // Convert server _id to client id for consistency
          console.log('Message read:', data.messageId);
          setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(msg =>
              msg.id === data.messageId ? { ...msg, status: MESSAGE_STATUS.READ } : msg
            );
            return [...updatedMessages]; // Forces React to re-render
          });
        });

        newSocket.on('messageDelivered', (data) => {
          // Convert server _id to client id for consistency
          console.log('Message delivered:', data.messageId);
          setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(msg =>
              msg.id === data.messageId ? { ...msg, status: MESSAGE_STATUS.DELIVERED } : msg
            );
            return [...updatedMessages]; // Forces React to re-render
          });
        });
        
        newSocket.on('messageError', (data) => {
          // Update message status to failed
          setMessages(prevMessages =>
              prevMessages.map(msg =>
                  msg.id === data.messageId ? { ...msg, status: 'failed' } : msg
              )
          );
          
          // Show error toast
          Toast.show({
            type: 'error',
            text1: 'Failed to send message',
            text2: data.error
          });
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from socket server');
            setIsConnected(false);
        });

        setSocket(newSocket);

        // Cleanup on component unmount
        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [user._id]);

    // Mark all unread messages as read when screen is focused
    useEffect(() => {
      if (socket && isConnected) {
        // Get all unread messages from the other user
        const unreadMessages = messages.filter(
          msg => !msg.isOwnMessage && msg.status !== MESSAGE_STATUS.READ
        );

        // Send read receipts for all unread messages
        unreadMessages.forEach(msg => {
          socket.emit('messageRead', {
            messageId: msg._id,
            senderId: msg.sender._id,
            receiverId: user._id,
            readAt: new Date(),
            chatId: chatId
          });
        });

        // Update local message status
        if (unreadMessages.length > 0) {
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              !msg.isOwnMessage ? { ...msg, status: MESSAGE_STATUS.READ } : msg
            )
          );
        }
      }
    }, [isConnected, messages.length]); 

    const sendMessage = () => {
      if (inputMessage.trim() && socket && isConnected && receiverUser) {
        const messageId = uuidv4();
        const timestamp = new Date();
        
        // Use 'id' consistently in your client-side message objects
        const newMessage = {
          id: messageId,  // Client uses 'id'
          text: inputMessage,
          timestamp,
          sender: user._id,
          isOwnMessage: true,
          status: MESSAGE_STATUS.SENDING
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // Send to server with chatId
        socket.emit('sendMessage', {
          senderId: user._id,
          receiverId: receiverUser._id,
          text: inputMessage,
          messageId,  // This becomes '_id' on the server
          createdAt: timestamp,
          chatId
        });
    
        // Update status to 'sent' after a short delay to simulate network
        setTimeout(() => {
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === messageId ? { ...msg, status: MESSAGE_STATUS.SENT } : msg  // Use 'id' consistently
            )
          );
        }, 500);
        
        // Clear input
        setInputMessage('');
      }
    };

    const formatTime = (date) => {
        return date instanceof Date 
          ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
          : '';
      };

    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
          setTimeout(() => {
            flatListRef?.current?.scrollToEnd({ animated: true });
          }, 100);
        }
    }, [messages]);

    const renderMessageStatus = (status) => {
      // console.log(status);
      switch(status) {
        case MESSAGE_STATUS.SENDING:
          return <Ionicons name="time-outline" size={14} color="white" />;
        case MESSAGE_STATUS.SENT:
          return <Ionicons name="checkmark-outline" size={14} color="white" />;
        case MESSAGE_STATUS.DELIVERED:
          return <Ionicons name="checkmark-done-outline" size={14} color="white" />;
        case MESSAGE_STATUS.READ:
          return <Ionicons name="checkmark-done-outline" size={14} color="white" />;
        case 'failed':
          return <Ionicons name="alert-circle-outline" size={14} color="red" />;
        default:
          return null;
      }
    };

    const renderMessage = ({ item }) => {
      return (
        <View style={[
          styles.messageContainer,
          item.isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
        ]}>
          <View style={[
            styles.messageBubble,
            item.isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
          ]}>
            <Text style={[
              styles.messageText,
              item.isOwnMessage ? styles.ownMessageText : null
            ]}>{item.text}</Text>
            
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
              {item.isOwnMessage && (
                <View style={styles.statusContainer}>
                  {renderMessageStatus(item.status)}
                </View>
              )}
            </View>
          </View>
        </View>
      );
    };
    
    if (!isConnected) {
    return (
        <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2196F3" />
        </View>
    );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chat with {receiverUser?._id}</Text>
            </View>
            
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
            />
            
            <View style={styles.inputContainer}>
                <TextInput
                style={styles.input}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Type a message..."
                multiline
                />
                <TouchableOpacity 
                style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]} 
                onPress={sendMessage}
                disabled={!inputMessage.trim()}
                >
                <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 60,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  messageContainer: {
    marginVertical: 5,
    flexDirection: 'row',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 2,
  },
  ownMessageBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: '#e5e5e5',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  ownMessageText: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 2,
  },
  messageTime: {
    fontSize: 11,
    color: '#555',
    marginRight: 5,
  },
  statusContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    width: 60,
    height: 40,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0D1F7',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default React.memo(ChatScreen);