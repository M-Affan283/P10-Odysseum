import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';
import { Chat, Message } from './models/Chat.js';

// Store online users and their connection counts
const connectedUsers = new Map();
// Store messages for offline users. change to database once socket is complete
const messages = new Map();

export const setupSocket = (server) => {
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      },
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ["websocket", "polling"],
    });

    io.on('connection', (socket) => {
      const userId = socket.handshake.query.userId;
      console.log(`User connected: ${userId}`);
      
      // Store socket id with user id
      connectedUsers.set(userId, socket.id);
      
      // Emit user online status to relevant users
      emitUserStatus(userId, true);

      // Handle typing indicators
      socket.on('typing', (data) => {
        const { chatId, receiverId } = data;
        const receiverSocketId = connectedUsers.get(receiverId);
        
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('userTyping', {
            chatId,
            userId
          });
        }
      });
      
      socket.on('stopTyping', (data) => {
        const { chatId, receiverId } = data;
        const receiverSocketId = connectedUsers.get(receiverId);
        
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('userStoppedTyping', {
            chatId,
            userId
          });
        }
      });
    
      // Handle sending a new message
      socket.on('sendMessage', async (messageData) => {
        const { senderId, receiverId, messageId, text, createdAt, chatId } = messageData;
        
        try {
          // Create a new message
          const message = new Message({
            _id: messageId,
            chatId: chatId,
            sender: senderId,
            receiver: receiverId,
            content: text,
            status: 'sent',
          });

          // Save the message to the database
          await message.save();
            
          // Update the last message in the chat
          await Chat.findByIdAndUpdate(chatId, {
            lastMessage: {
              content: text,
              sender: senderId,
              timestamp: createdAt
            }
          });
          
          // Increment unread count for the receiver
          const chat = await Chat.findById(chatId);
          if (!chat) {
            throw new Error('Chat not found');
          }
          
          chat.incrementUnreadCount(receiverId);
          await chat.save();
          
          // Check if the receiver is online
          const receiverSocketId = connectedUsers.get(receiverId);
          
          if (receiverSocketId) {
            // Deliver message to receiver
            io.to(receiverSocketId).emit('message', message);

            // Update message status to delivered
            await Message.findByIdAndUpdate(messageId, {
              status: 'delivered',
              deliveredAt: new Date()
            });
            
            // Notify sender that message was delivered
            const senderSocketId = connectedUsers.get(senderId);
            if (senderSocketId) {
              io.to(senderSocketId).emit('messageDelivered', {
                messageId: messageId,
                deliveredAt: new Date()
              });
            }
          } else {
            // Receiver is offline - we could store the message for later delivery
            console.log(`User ${receiverId} is offline. Message queued.`);
            const senderSocketId = connectedUsers.get(senderId);
            if (senderSocketId) {
              io.to(senderSocketId).emit('messageQueued', {
                messageId: messageId,
                receiverId: receiverId
              });
            }
          }
        } catch (error) {
          console.error('Error sending message:', error);
          // Notify sender of the error
          const senderSocketId = connectedUsers.get(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('messageError', {
              messageId: messageId,
              error: error.message || 'Failed to send message'
            });
          }
        }
      });
    
      // Handle message read receipt
      socket.on('messageRead', async (data) => {
        const { messageId, senderId, receiverId, readAt, chatId } = data;
        
        try {
          // Update message status in the database
          await Message.findByIdAndUpdate(messageId, {
            status: 'read',
            readAt: readAt
          });
          
          // Reset unread count for the reader in this chat
          if (chatId) {
            const chat = await Chat.findById(chatId);
            if (chat) {
              chat.setUnreadCount(receiverId, 0);
              await chat.save();
            }
          }
          
          // Notify the sender that their message was read
          const senderSocketId = connectedUsers.get(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('messageRead', {
              messageId: messageId,
              readAt
            });
          }
        } catch (error) {
          console.error('Error updating read status:', error);
          socket.emit('error', {
            type: 'messageReadError',
            message: 'Failed to mark message as read',
            details: error.message
          });
        }
      });
    
      // When a user reconnects, deliver any pending messages
      socket.on('getUndeliveredMessages', async (data) => {
        console.log(`User ${userId} checking for undelivered messages...`);
        
        try {
          const { userId, chatId } = data;
          
          if (!chatId) {
            throw new Error('Chat ID is required');
          }
          
          // Find all undelivered messages for this user in this chat
          const pendingMessages = await Message.find({
            receiver: userId,
            chatId: chatId,
            status: 'sent'
          });
          
          // Send all pending messages to the user
          if (pendingMessages.length > 0) {
            console.log(`Found ${pendingMessages.length} pending messages for user ${userId} in chat ${chatId}`);
            
            for (const message of pendingMessages) {
              // Format message for client
              const messageData = {
                _id: message._id,
                sender: message.sender,
                receiverId: message.receiver,
                content: message.content,
                createdAt: message.createdAt,
                chatId: message.chatId
              };
              
              // Send message to client
              socket.emit('message', messageData);
              
              // Update message status to delivered
              message.status = 'delivered';
              message.deliveredAt = new Date();
              await message.save();
              
              // Notify sender
              const senderSocketId = connectedUsers.get(message.sender.toString());
              if (senderSocketId) {
                io.to(senderSocketId).emit('messageDelivered', {
                  messageId: message._id,
                  deliveredAt: new Date()
                });
              }
            }
          } else {
            console.log(`No pending messages for user ${userId} in chat ${chatId}`);
          }
        } catch (error) {
          console.error('Error delivering pending messages:', error);
          socket.emit('error', {
            type: 'undeliveredMessagesError',
            message: 'Failed to retrieve undelivered messages',
            details: error.message
          });
        }
      });
      
      // Handle user going offline
      socket.on('logout', () => {
        if (userId) {
          connectedUsers.delete(userId);
          emitUserStatus(userId, false);
          console.log(`User logged out: ${userId}`);
        }
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        // Find user from connected users map
        if (userId) {
          connectedUsers.delete(userId);
          emitUserStatus(userId, false);
          console.log(`User disconnected: ${userId}`);
        }
      });
    });
    
    // Helper function to emit user online/offline status
    function emitUserStatus(userId, isOnline) {
      // Find all chats this user is part of
      Chat.find({ participants: userId })
        .then(chats => {
          chats.forEach(chat => {
            // For each chat, notify the other participant
            const otherParticipantId = chat.participants.find(p => p.toString() !== userId.toString());
            if (otherParticipantId) {
              const otherParticipantSocketId = connectedUsers.get(otherParticipantId.toString());
              if (otherParticipantSocketId) {
                io.to(otherParticipantSocketId).emit('userStatus', {
                  userId,
                  isOnline,
                  lastSeen: isOnline ? null : new Date()
                });
              }
            }
          });
        })
        .catch(err => {
          console.error('Error emitting user status:', err);
        });
    }

    return io;
};