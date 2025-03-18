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
            methods: ["GET", "POST"]
        } 
    });

    io.on('connection', (socket) => {
      const userId = socket.handshake.query.userId;
      console.log(`User connected: ${userId}`);
      
      // Store socket id with user id
      connectedUsers.set(userId, socket.id);
    
      // Handle sending a new message
      socket.on('sendMessage', async (messageData) => {
        const { senderId, receiverId, messageId, text, createdAt, chatId } = messageData;

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
        chat.incrementUnreadCount(receiverId);
        await chat.save();
        
        
        // Check if the receiver is online
        const receiverSocketId = connectedUsers.get(receiverId);
        
        if (receiverSocketId) {
          // Deliver message to receiver
          io.to(receiverSocketId).emit('message', message);

          await Message.findByIdAndUpdate(messageId, {
            status: 'delivered',
            deliveredAt: new Date()
          });
          
          // Update message status to delivered
          // messages.set(messageId, {
          //   ...messages.get(messageId),
          //   status: 'delivered',
          //   deliveredAt: new Date()
          // });
          
          // Notify sender that message was delivered
          const senderSocketId = connectedUsers.get(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('messageDelivered', {
              messageId: messageId,  // Use messageId consistently
              deliveredAt: new Date()
            });
          }
        } else {
          // Receiver is offline - we could store the message for later delivery
          console.log(`User ${receiverId} is offline. Message queued.`);
          // console.log("Message Data: ", messages);
          const senderSocketId = connectedUsers.get(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('messageQueued', {
              messageId: messageId,
              receiverId: receiverId
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
              messageId: messageId,  // Use messageId consistently instead of _id
              readAt
            });
          }
        } catch (error) {
          console.error('Error updating read status:', error);
        }
      });
    
      // When a user reconnects, deliver any pending messages
      socket.on('getUndeliveredMessages', async () => {
        console.log(`User ${userId} reconnected. Checking for undelivered messages...`);
        
        try {
          // Find all undelivered messages for this user
          const pendingMessages = await Message.find({
            receiver: userId,
            status: 'sent'
          })//.populate('sender', 'name profilePicture');
          
          // Send all pending messages to the user
          if (pendingMessages.length > 0) {
            console.log("Pending Messages: ", pendingMessages);
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
              const senderSocketId = connectedUsers.get(message.sender._id.toString());
              if (senderSocketId) {
                io.to(senderSocketId).emit('messageDelivered', {
                  messageId: message._id,
                  deliveredAt: new Date()
                });
              }
            }
          }
        } catch (error) {
          console.error('Error delivering pending messages:', error);
        }
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        // Remove user from connected users
        for (const [key, value] of connectedUsers.entries()) {
          if (value === socket.id) {
            connectedUsers.delete(key);
            console.log(`User disconnected: ${key}`);
            break;
          }
        }
      });
    });

    return io;
};